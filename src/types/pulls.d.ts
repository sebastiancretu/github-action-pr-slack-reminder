/* tslint:disable */
export interface Repository {
  repository: PullRequests;
}

export interface PullRequests {
  pullRequests: Nodes<PullRequest[]>;
}

export interface PullRequest {
  author: User;
  assignees: Nodes<User[]>;
  reviewRequests: Nodes<RequestedReviewer[]>;
  labels: Nodes<Label[]>;
  isDraft: boolean;
  mergeable: MergeableType;
  reviewDecision: ReviewDecisionType | null;
  title: string;
  updatedAt: string;
  publishedAt: string;
  url: string;
}

export interface Nodes<T> {
  nodes: T;
  totalCount?: number;
}

export interface RequestedReviewer {
  requestedReviewer: User;
}

export interface User {
  login: string;
}

export interface Label {
  name: string;
}

export const enum MergeableType {
  MERGEABLE = 'MERGEABLE',
  CONFLICTING = 'CONFLICTING',
  UNKNOWN = 'UNKNOWN',
  REVIEW_NEEDED = 'REVIEW_NEEDED',
}

export const enum ReviewDecisionType {
  CHANGES_REQUESTED = 'CHANGES_REQUESTED',
  APPROVED = 'APPROVED',
  REVIEW_REQUIRED = 'REVIEW_REQUIRED',
}

export const enum StateType {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  MERGED = 'MERGED',
}
