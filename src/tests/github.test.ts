import { describe, expect, jest, it } from '@jest/globals';
import formatISO from 'date-fns/formatISO';
import subDays from 'date-fns/subDays';
import { needReviewPullRequests } from '../utils/github';
describe('filterPullRequests', () => {
  it('PRs with requested_reviewers should return a PR', async () => {
    const pull_requests = [
      {
        updated_at: formatISO(new Date()),
        requested_reviewers: [
          {
            id: 110375909,
          },
        ],
        requested_teams: [],
        labels: [],
        draft: false,
      },
    ] as any;
    await expect(needReviewPullRequests({ pull_requests })).toHaveLength(1);
  });

  it('PRs with no reviewers should not return a PR', async () => {
    const pull_requests = [
      {
        updated_at: formatISO(new Date()),
        requested_reviewers: [],
        requested_teams: [],
        labels: [],
        draft: false,
      },
    ] as any;
    await expect(needReviewPullRequests({ pull_requests })).toHaveLength(0);
  });

  it('PRs with requested_teams should return a PR', async () => {
    const pull_requests = [
      {
        updated_at: formatISO(new Date()),
        requested_reviewers: [],
        requested_teams: [
          {
            id: 110375909,
          },
        ],
        labels: [],
        draft: false,
      },
    ] as any;
    await expect(needReviewPullRequests({ pull_requests })).toHaveLength(1);
  });

  it('Draft PRs should not return a PR', async () => {
    const pull_requests = [
      {
        updated_at: formatISO(new Date()),
        requested_reviewers: [],
        requested_teams: [
          {
            id: 110375909,
          },
        ],
        labels: [],
        draft: true,
      },
    ] as any;
    await expect(needReviewPullRequests({ pull_requests })).toHaveLength(0);
  });

  it('PRs with labels should return a PR', async () => {
    const pull_requests = [
      {
        updated_at: formatISO(new Date()),
        requested_reviewers: [
          {
            id: 110375909,
          },
        ],
        requested_teams: [],
        labels: [{ name: 'no-reminder' }],
        draft: false,
      },
    ] as any;
    await expect(needReviewPullRequests({ pull_requests })).toHaveLength(1);
  });

  it('PRs with excluded labels should not return a PR', async () => {
    const pull_requests = [
      {
        updated_at: formatISO(new Date()),
        requested_reviewers: [
          {
            id: 110375909,
          },
        ],
        requested_teams: [],
        labels: [{ name: 'no-reminder' }],
        draft: false,
      },
    ] as any;
    await expect(
      needReviewPullRequests({ pull_requests, excludedLabel: 'no-reminder' })
    ).toHaveLength(0);
  });

  it('Only PRs older than 2 days should be returned', async () => {
    const pull_requests = [
      {
        id: 1,
        updated_at: formatISO(new Date()),
        requested_reviewers: [
          {
            id: 110375909,
          },
        ],
        requested_teams: [],
        labels: [],
        draft: false,
      },
      {
        id: 2,
        updated_at: subDays(new Date(), 3),
        requested_reviewers: [
          {
            id: 10000000,
          },
        ],
        requested_teams: [
          {
            id: 10000100,
          },
        ],
        labels: [],
        draft: false,
      },
    ] as any;
    const prs = await needReviewPullRequests({ pull_requests, olderThan: 2 });
    expect(prs).toHaveLength(1);
    expect(prs[0].id).toEqual(2);
  });
});
