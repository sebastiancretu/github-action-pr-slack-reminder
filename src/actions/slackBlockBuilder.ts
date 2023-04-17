import * as core from '@actions/core';
import * as github from '@actions/github';
import { ChatMeMessageArguments } from '@slack/web-api';
import formatDistance from 'date-fns/formatDistance';

import { MergeableType, PullRequest } from '../types/pulls';
import {
  CustomMessageAttachment,
  PullRequestMappingType,
} from '../types/slack';
import { createUsersToString, getUsersMapping } from '../utils/users-mapping';
import { messages } from '../config/review-reminder-text';

export const headingSection = (text: string) => {
  return {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text,
    },
  };
};

export const buildPullRequestTextBlock = ({
  title_link,
  title,
  users,
  operation,
  updatedAt,
}: {
  title_link: string;
  title: string;
  users: string;
  operation: MergeableType;
  updatedAt: string;
}): [CustomMessageAttachment] => {
  const colorMapping: PullRequestMappingType = {
    CONFLICTING: '#FFB52E',
    UNKNOWN: '#FF5C5C',
    MERGEABLE: '#36a64f',
    REVIEW_NEEDED: '#FF5C5C',
  };
  const actionMapping: PullRequestMappingType = {
    CONFLICTING: 'conflict solving',
    UNKNOWN: 'action',
    MERGEABLE: 'merge',
    REVIEW_NEEDED: 'review',
  };
  return [
    {
      color: colorMapping[operation],
      title,
      title_link,
      footer: `Awaiting *${
        actionMapping[operation]
      }* from: ${users} • Last updated *${formatDistance(
        new Date(updatedAt),
        new Date(),
        { addSuffix: true }
      )}*`,
      mrkdwn_in: ['footer'],
    },
  ];
};

export const buildMessage = async ({
  needReview,
  readyToMerge,
}: {
  needReview: PullRequest[];
  readyToMerge: PullRequest[];
}): Promise<ChatMeMessageArguments> => {
  const s3UsersMapping = await getUsersMapping({
    bucket: core.getInput('aws-s3-bucket'),
    key: core.getInput('aws-s3-object-key'),
    region: core.getInput('aws-region'),
  });
  const needReviewBlocks = needReview.flatMap((pr) =>
    buildPullRequestTextBlock({
      title_link: pr.url,
      title: pr.title,
      operation: MergeableType.REVIEW_NEEDED,
      users: createUsersToString({
        users: pr.reviewRequests.nodes.map(
          (user) => user.requestedReviewer.login
        ),
        s3UsersMapping: s3UsersMapping.engineers,
      }),
      updatedAt: pr.updatedAt,
    })
  );
  const readyToMergeBlocks = readyToMerge.flatMap((pr) =>
    buildPullRequestTextBlock({
      title_link: pr.url,
      title: pr.title,
      operation: pr.mergeable,
      users: createUsersToString({
        users: !pr.assignees.nodes.length
          ? [pr.author.login]
          : pr.assignees.nodes.map((user) => user.login),
        s3UsersMapping: s3UsersMapping.engineers,
      }),
      updatedAt: pr.updatedAt,
    })
  );
  const attachments = [...needReviewBlocks, ...readyToMergeBlocks];
  const attachmentsSize = JSON.stringify(attachments).length;

  // we need to limit the number of characters for slack messages
  // if message is too long, remove the last 3 entries
  while (JSON.stringify(attachments).length > 3000) {
    attachments.splice(attachments.length - 1, 1);
  }

  const randomMessage = Math.floor(Math.random() * messages.length);
  const partialFullText =
    attachmentsSize > 3000 &&
    `<${github.context.serverUrl}/${github.context.repo.owner}/${github.context.repo.repo}/pulls|*Here*> Here are a few pull requests that need your review.`;
  const blocks = [headingSection(`${randomMessage} ${partialFullText}`)];

  return {
    channel: core.getInput('channel-id'),
    text:
      core.getInput('slack-block-title') ||
      'Pull Request Reminders Notification',
    blocks,
    attachments,
  };
};
