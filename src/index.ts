import {
  needReviewPullRequests,
  fetchPullRequests,
  readyToMergePullRequests,
} from './actions/github';
import { buildMessage } from './actions/slackBlockBuilder';
import { slackWebClient } from './utils/slack-client';

const run = async (): Promise<void> => {
  const prs = await fetchPullRequests();
  const needReview = needReviewPullRequests({ pullRequests: prs });
  const readyToMerge = readyToMergePullRequests({
    pullRequests: prs,
  });

  if (!needReview.length && !readyToMerge.length) {
    return;
  }

  slackWebClient.chat.postMessage(
    await buildMessage({ needReview, readyToMerge })
  );
};

run();
