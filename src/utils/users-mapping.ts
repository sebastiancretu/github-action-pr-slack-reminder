import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { GithubSlackMapping } from '../types/users.d';

export const getUsersMapping = ({
  bucket,
  key,
  region,
}: {
  bucket: string;
  key: string;
  region: string;
}): Promise<{
  engineers: GithubSlackMapping[];
}> => {
  return new Promise(async (resolve, reject) => {
    if (!bucket || !key || !region) {
      throw 'Missing required inputs for AWS';
    }

    const client = new S3Client({ region });
    const getObjectCommand = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    try {
      const response = await client.send(getObjectCommand);
      let responseDataChunks: string[] = [];

      if (response && response.Body) {
        const body: any = response.Body;
        body.once('error', (err: Error) => reject(err));
        body.on('data', (chunk: string) => responseDataChunks.push(chunk));
        body.once('end', () =>
          resolve(JSON.parse(responseDataChunks.join('')))
        );
      }
    } catch (error) {
      return reject(error);
    }
  });
};

export const createUsersToString = ({
  users,
  s3UsersMapping,
}: {
  users: string[];
  s3UsersMapping: GithubSlackMapping[];
}): string => {
  const slackIdsConcat = users.reduce((out: any, user) => {
    const slackUserId = s3UsersMapping?.find(
      (config) => config.github_username === user
    )?.slack_id;
    out.push(`<@${slackUserId}>`);
    return out;
  }, []);

  return String(slackIdsConcat);
};
