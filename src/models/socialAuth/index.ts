import db from '../db';
import { SocialAuth } from 'src/types';

type CreateSocialAuthPayload = Omit<SocialAuth, 'id' | 'created_on'>;

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