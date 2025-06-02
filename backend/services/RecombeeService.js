import recombee from 'recombee-api-client';
import axios from 'axios';
import { Job } from '../models/job.model.js';
import { JOB_API_END_POINT } from '../utils/constant.js';

class RecombeeService {
  constructor() {
    this.client = new recombee.ApiClient(
      process.env.RECOMBEE_CLIENT_ID,
      process.env.RECOMBEE_API_TOKEN
    );
  }

  async addUser(userId, skills) {
    try {
      await this.client.send(new recombee.AddUser(userId));
      await this.client.send(new recombee.SetUserValues(userId, {
        skills: Array.isArray(skills) ? skills.join(',') : ''
      }));
      console.log(`Added user ${userId} with skills: ${skills.join(',')}`);
    } catch (error) {
      throw new Error(`Failed to add user to Recombee: ${error.message}`);
    }
  }

  async syncJobs() {
    try {
      const jobs = await Job.find({ recombeeSynced: false });
      for (const job of jobs) {
        await this.client.send(new recombee.AddItem(job._id.toString()));
        await this.client.send(new recombee.SetItemValues(job._id.toString(), {
          title: job.title || '',
          skills: job.requirements?.join(',') || '',
          location: job.location || '',
          description: job.description || ''
        }));
        await Job.updateOne({ _id: job._id }, { recombeeSynced: true });
      }
      console.log(`Synced ${jobs.length} jobs to Recombee`);
      return jobs.length;
    } catch (error) {
      throw new Error(`Failed to sync jobs to Recombee: ${error.message}`);
    }
  }

  async getRecommendations(userId, limit = 3, options = {}) {
    try {
      const recommendations = await this.client.send(
        new recombee.RecommendItemsToUser(userId, limit, {
          scenario: 'job-recommendations',
          returnProperties: true,
          ...options
        })
      );
      return recommendations.recomms;
    } catch (error) {
      throw new Error(`Failed to get recommendations: ${error.message}`);
    }
  }

  async syncJobsFromApi() {
    try {
      const response = await axios.get(JOB_API_END_POINT);
      const jobs = response.data.jobs || [];
      for (const job of jobs) {
        const exists = await Job.findOne({ _id: job._id });
        if (!exists || !exists.recombeeSynced) {
          await this.client.send(new recombee.AddItem(job._id));
          await this.client.send(new recombee.SetItemValues(job._id, {
            title: job.title || '',
            skills: job.requirements?.join(',') || '',
            location: job.location || '',
            description: job.description || ''
          }));
          await Job.updateOne(
            { _id: job._id },
            { $set: { recombeeSynced: true, ...job } },
            { upsert: true }
          );
        }
      }
      console.log(`Synced ${jobs.length} jobs from API`);
      return jobs.length;
    } catch (error) {
      console.error(`Failed to sync jobs from API: ${error.message}`);
      throw new Error(`Failed to sync jobs from API: ${error.message}`);
    }
  }
}

export default new RecombeeService();