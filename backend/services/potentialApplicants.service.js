import { User } from '../models/user.model.js';
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

export const findPotentialApplicants = async (job, topN = 10) => {
    try {
        const users = await User.find({ 'profile.isFindJob': true })
            .select('_id email fullname profile.skills profile.bio profile.isPublic profile.lastFindJobUpdate');

        if (!users.length) {
            return { message: ' No applicants are looking for a job', success: true, data: [] };
        }

        const jobRequirements = job.requirements.map(normalize);

        const applicants = users.map(user => {
            let score = 0;
            let technicalScore = 0;
            const matchedSkills = new Set();

            let inferredSkills = user.profile.skills ? user.profile.skills.map(normalize) : ['communication', 'teamwork'];
            inferredSkills = expandSkills([...new Set(inferredSkills)]);

            for (const skill of inferredSkills) {
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
                    inferredSkills.forEach(skill => {
                        const similarity = natural.JaroWinklerDistance(skill, word);
                        if (similarity >= 0.85) {
                            titleScore += similarity * 0.3; 
                        }
                    });
                });
                score += titleScore;
            }

            if (user.profile.bio && job.description) {
                const tfidf = new natural.TfIdf();
                tfidf.addDocument(user.profile.bio.toLowerCase());
                let bioScore = 0;
                job.description.toLowerCase().split(' ').forEach(word => {
                    tfidf.tfidfs(word, (i, measure) => {
                        if (measure > 0) bioScore += measure * 0.1;
                    });
                });
                score += bioScore;
            }

            // Ưu tiên user mới bật isFindJob
            const recentThreshold = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            if (user.profile.lastFindJobUpdate && user.profile.lastFindJobUpdate > recentThreshold) {
                score *= 1.2;
            }

            return {
                applicant: {
                    id: user._id,
                    fullname: user.fullname,
                    email: user.profile.isPublic ? user.email : undefined,
                    skills: user.profile.skills,
                    bio: user.profile.bio,
                    isPublic: user.profile.isPublic
                },
                matchedSkills: [...matchedSkills],
                score
            };
        });

        const filteredApplicants = applicants
            .filter(applicant => applicant.score > 1 && applicant.matchedSkills.some(skill => !softSkills.includes(normalize(skill))))
            .sort((a, b) => b.score - a.score)
            .slice(0, topN)
            .map(applicant => ({
                ...applicant.applicant,
                matchedSkills: applicant.matchedSkills,
                score: applicant.score
            }));

        return {
            message: filteredApplicants.length ? 'Potential applicants found success' : 'Potential applicants not found',
            success: true,
            data: filteredApplicants
        };
    } catch (error) {
        console.error('Error findPotentialApplicants service:', error);
        throw error;
    }
};