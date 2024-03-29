import db from '../db';
import { SocialAuth, CreateSocialAuthPayload, socialTypes } from 'src/types';


const getSocialAuthById = async (authId: string): Promise<SocialAuth[]> => {
  return db('social_auth')
    .select()
    .where({ id: authId });
};

const getSocialAuthByJobId = async (jobId: string, filterObj: any = {}, fieldsOnlyArray: string[] = []): Promise<SocialAuth[]> => {
  const filter = { job_id: jobId, ...filterObj };
  const fieldsToFetch = fieldsOnlyArray?.length
    ? fieldsOnlyArray
    : [];
  return db('social_auth')
    .select(fieldsToFetch)
    .where(filter);
};

const createSocialAuthForJob = async (payload: CreateSocialAuthPayload): Promise<SocialAuth[]> => {
  return db('social_auth')
    .insert(payload)
    .returning('*');
};

const deleteSocialAuthForJobByType = async (jobId: string, reqType: 'source' | 'target'): Promise<SocialAuth[]> => {
  return db('social_auth')
    .where({
      job_id: jobId,
      type: reqType
    }).delete()
};


export default { getSocialAuthById, getSocialAuthByJobId, createSocialAuthForJob, deleteSocialAuthForJobByType }