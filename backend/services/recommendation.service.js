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

const calculateExperienceYears = (experiences) => {
    if (!experiences || !experiences.length) return 0;
    let totalMonths = 0;
    experiences.forEach(exp => {
        if (exp.startDate && exp.endDate) {
            const start = new Date(exp.startDate);
            const end = new Date(exp.endDate);
            totalMonths += (end.getFullYear() - start.getFullYear()) * 12 + end.getMonth() - start.getMonth();
        }
    });
    return totalMonths / 12;
};

export const recommendJobs = async (userId, topN = 5) => {
    try {
        const user = await User.findById(userId).select('profile.skills profile.bio profile.isFindJob profile.lastFindJobUpdate experience');
        if (!user) {
            throw new Error('User not found');
        }
        if (!user.profile.isFindJob) {
            return { message: 'User not looking for a job', success: true, data: [] };
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

        // Phân tích bio bằng TF-IDF
        const tfidf = new natural.TfIdf();
        if (user.profile.bio) {
            tfidf.addDocument(user.profile.bio.toLowerCase());
        }

        const recommendations = jobs.map(job => {
            let score = 0;
            let technicalScore = 0;
            const matchedSkills = new Set();

            // So khớp kỹ năng
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

            // So khớp kinh nghiệm
            if (job.experienceLevel !== null && userExperience !== null) {
                const expDiff = Math.abs(job.experienceLevel - userExperience);
                score += (1 - expDiff / 10) * 2; // Trọng số 2
            }

            // Phân tích bio
            if (user.profile.bio && job.description) {
                let bioScore = 0;
                job.description.toLowerCase().split(' ').forEach(word => {
                    tfidf.tfidfs(word, (i, measure) => {
                        if (measure > 0) bioScore += measure * 0.1; // Trọng số thấp
                    });
                });
                score += bioScore;
            }

            // Điểm từ số ứng tuyển
            score += (job.applications?.length || 0) * 0.05; // Trọng số thấp

            // Ưu tiên người mới bật isFindJob
            const recentThreshold = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            if (user.profile.lastFindJobUpdate && user.profile.lastFindJobUpdate > recentThreshold) {
                score *= 1.2; // Tăng 20%
            }

            return {
                job: {
                    id: job._id,
                    title: job.title,
                    description: job.description ? job.description.split('\n').map(line => line.trim()).filter(line => line) : [],
                    requirements: job.requirements || [],
                    salary: job.salary,
                    experienceLevel: job.experienceLevel,
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
            message: filteredRecommendations.length ? 'Gợi ý công việc thành công' : 'Không tìm thấy công việc phù hợp',
            success: true,
            data: filteredRecommendations
        };
    } catch (error) {
        console.error('Lỗi gợi ý công việc:', error);
        throw error;
    }
};