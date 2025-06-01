import { Job } from "../models/job.model.js";
import { User } from "../models/user.model.js";
import skillMappings from "../configs/skillMappings.js";
import natural from 'natural';

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


export async function recommendJobs(userId, topN = 10) {
    try {
        const user = await User.findById(userId).select('profile.skills');
        if (!user) {
            throw createError('No user found', 404);
        }
        const jobs = await Job.find({})
            .populate({
                path: 'company',
                select: 'name description website location logo contactInfo',
            })
            .populate({
                path: 'applications',
                select: '_id userId status createdAt',
            })
            .lean();

        let inferredSkills = [];

        if (user.profile.skills && user.profile.skills.length > 0) {
            inferredSkills.push(...user.profile.skills.map(normalize));
        }

        if (inferredSkills.length === 0) {
            inferredSkills = ['communication', 'teamwork'];
        }

        inferredSkills = expandSkills([...new Set(inferredSkills)]);

        const jobScores = jobs.map((job) => {
            let score = 0;
            const matchedSkills = new Set();
            const jobRequirements = job.requirements.map(normalize);

            for (const skill of inferredSkills) {
                for (const req of jobRequirements) {
                    const similarity = natural.JaroWinklerDistance(skill, req);
                    if (similarity >= 0.9 && !matchedSkills.has(req)) {
                        score += similarity;
                        matchedSkills.add(req);
                        break;
                    }
                }
            }


            score += (job.applications?.length || 0) * 0.1;
            return { job, score, matchedSkills: [...matchedSkills] };
        });

        const recommendations = jobScores
            .filter((item) => item.score >= 1)
            .sort((a, b) => b.score - a.score)
            .slice(0, topN)
            .map((item) => ({
                id: item.job._id,
                title: item.job.title,
                description: item.job.description
                    ? item.job.description.split('\n').map(line => line.trim()).filter(line => line)
                    : [],
                requirements: item.job.requirements || [],
                salary: item.job.salary,
                experienceLevel: item.job.experienceLevel,
                location: item.job.location,
                jobType: item.job.jobType,
                position: item.job.position,
                company: item.job.company,
                deadline: item.job.deadline ? item.job.deadline.toISOString().split('T')[0] : null,
                benefits: item.job.benefits || [],
                level: item.job.level,
                applications: item.job.applications,
                createdAt: item.job.createdAt,
                updatedAt: item.job.updatedAt,
                matchedSkills: item.matchedSkills,
                score: item.score,
            }));

        return recommendations;
    } catch (error) {
        throw error;
    }
}