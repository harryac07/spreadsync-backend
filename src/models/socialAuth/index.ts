import db from '../db';
import { SocialAuth, CreateSocialAuthPayload } from 'src/types';


const getSocialAuthById = async (authId: string): Promise<SocialAuth[]> => {
  return db('social_auth')
    .select()
    .where({ id: authId });
};

const getSocialAuthByJobId = async (jobId: string): Promise<SocialAuth[]> => {
  return db('social_auth')
    .select()
    .where({ job_id: jobId });
};

const createSocialAuthForJob = async (payload: CreateSocialAuthPayload): Promise<SocialAuth[]> => {
  return db('social_auth')
    .insert(payload)
    .returning('*');
};


export default { getSocialAuthById, getSocialAuthByJobId, createSocialAuthForJob }