import * as github from '@actions/github';
import * as core from '@actions/core';
import { pullRequestsQuery } from '../queries/pull-requests';
import { PullRequest, Repository, ReviewDecisionType } from '../types/pulls';

export const fetchPullRequests = async (): Promise<PullRequest[]> => {
  const githubToken = core.getInput('github-token');
  const octokit = github.getOctokit(githubToken);
  const args = {
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    states: ['OPEN'],
    orderBy: {
      field: 'CREATED_AT',
      direction: 'DESC',
    },
    last: 100,
  };
  const result: Repository = await octokit.graphql(pullRequestsQuery, args);

  return result.repository.pullRequests.nodes;
};

export const needReviewPullRequests = ({
  pullRequests,
}: {
  pullRequests: PullRequest[];
}) => {
  const excludeLabel = core?.getInput('exclude-label');
  const olderThan = core?.getInput('older-than') || 0;

  return pullRequests.filter(
    (pr) =>
      pr.reviewRequests.totalCount &&
      !pr.isDraft &&
      pr.reviewDecision !== ReviewDecisionType.APPROVED &&
      !pr.labels.nodes.find((label) => excludeLabel?.trim() === label.name) &&
      Math.ceil(
        (new Date().getTime() - new Date(pr.publishedAt).getTime()) /
          (1000 * 3600 * 24)
      ) >= olderThan
  );
};

export const readyToMergePullRequests = ({
  pullRequests,
}: {
  pullRequests: PullRequest[];
}) => {
  const excludeLabel = core?.getInput('exclude-label');

  return pullRequests.filter(
    (pr) =>
      !pr.isDraft &&
      !pr.labels.nodes.find((label) => excludeLabel?.trim() === label.name) &&
      !pr.reviewRequests.totalCount &&
      pr.reviewDecision === ReviewDecisionType.APPROVED
  );
};
