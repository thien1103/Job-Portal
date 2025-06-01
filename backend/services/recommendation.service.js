import { User } from '../models/user.model.js';
import { Job } from '../models/job.model.js';
import natural from 'natural';
import skillMappings from '../configs/skillMappings.js';

const normalize = (str) => str.toLowerCase().trim();

const expandSkills = (skills) => {
    const expanded = [];
    skills.forEach((skill) => {
        const normalizedSkill = normalize(skill);
        expanded.push(normalizedSkill);
        if (skillMappings[normalizedSkill]) {
            expanded.push(...skillMappings[normalizedSkill].map(normalize));
        }
    });
    return [...new Set(expanded)];
};

const softSkills = [
    'communication', 'teamwork', 'self-study', 'problem-solving', 'reading',
    'technical document comprehension ability', 'analytical thinking',
    'compliance knowledge', 'customer service'
];

export const recommendJobs = async (userId, topN = 5) => {
    try {
        const user = await User.findById(userId).select('profile.skills profile.bio profile.isFindJob profile.lastFindJobUpdate experience');
        if (!user) {
            throw new Error('User not found');
        }
        if (!user.profile.isFindJob) {
            return { message: 'User is not looking for a job', success: true, data: [] };
        }

        const jobs = await Job.find()
            .populate('company', 'name')
            .select('title requirements salary experienceLevel location jobType position company deadline benefits level applications createdAt updatedAt')
            .lean();

        if (!jobs.length) {
            return { message: 'No job found', success: true, data: [] };
        }

        const userSkills = user.profile.skills ? user.profile.skills.map(normalize) : ['communication', 'teamwork'];
        const expandedSkills = expandSkills([...new Set(userSkills)]);
        const userExperience = calculateExperienceYears(user.experience);

        const tfidf = new natural.TfIdf();
        if (user.profile.bio) {
            tfidf.addDocument(user.profile.bio.toLowerCase());
        }

        const recommendations = jobs.map(job => {
            let score = 0;
            let technicalScore = 0;
            const matchedSkills = new Set();

            const jobRequirements = job.requirements.map(normalize);
            for (const skill of expandedSkills) {
                for (const req of jobRequirements) {
                    const similarity = natural.JaroWinklerDistance(skill, req);
                    if (similarity >= 0.85 && !matchedSkills.has(req)) {
                        const weight = softSkills.includes(skill) ? 0.5 : 1;
                        score += similarity * weight;
                        if (!softSkills.includes(skill)) technicalScore += similarity;
                        matchedSkills.add(req);
                        break;
                    }
                }
            }

            if (job.title) {
                let titleScore = 0;
                const titleWords = normalize(job.title).split(' ');
                titleWords.forEach(word => {
                    expandedSkills.forEach(skill => {
                        const similarity = natural.JaroWinklerDistance(skill, word);
                        if (similarity >= 0.85) {
                            titleScore += similarity * 0.3;
                        }
                    });
                });
                score += titleScore;
            }

            if (user.profile.bio && job.description) {
                let bioScore = 0;
                job.description.toLowerCase().split(' ').forEach(word => {
                    tfidf.tfidfs(word, (i, measure) => {
                        if (measure > 0) bioScore += measure * 0.1;
                    });
                });
                score += bioScore;
            }

            score += (job.applications?.length || 0) * 0.05;

            const recentThreshold = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            if (user.profile.lastFindJobUpdate && user.profile.lastFindJobUpdate > recentThreshold) {
                score *= 1.2;
            }

            return {
                job: {
                    id: job._id,
                    title: job.title,
                    description: job.description ? job.description.split('\n').map(line => line.trim()).filter(line => line) : [],
                    requirements: job.requirements || [],
                    salary: job.salary,
                    location: job.location,
                    jobType: job.jobType,
                    position: job.position,
                    company: job.company,
                    deadline: job.deadline ? job.deadline.toISOString().split('T')[0] : null,
                    benefits: job.benefits || [],
                    level: job.level,
                    applications: job.applications,
                    createdAt: job.createdAt,
                    updatedAt: job.updatedAt
                },
                matchedSkills: [...matchedSkills],
                score
            };
        });

        const filteredRecommendations = recommendations
            .filter(rec => rec.score > 1 && rec.matchedSkills.some(skill => !softSkills.includes(normalize(skill))))
            .sort((a, b) => b.score - a.score)
            .slice(0, topN)
            .map(rec => ({
                ...rec.job,
                matchedSkills: rec.matchedSkills,
                score: rec.score
            }));

        return {
            message: filteredRecommendations.length ? 'Job requirement success' : 'Job requirement not found',
            success: true,
            data: filteredRecommendations
        };
    } catch (error) {
        console.error('Error Recommend job service:', error);
        throw error;
    }
};