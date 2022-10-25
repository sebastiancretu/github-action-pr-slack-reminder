export const pullRequestsQuery = `query pullRequests(
  $owner: String!
  $repo: String!
  $states: [PullRequestState!]
  $orderBy: IssueOrder
  $last: Int
) {
  repository(owner: $owner, name: $repo, followRenames: true) {
    ...Pulls
  }
}

fragment Pulls on Repository {
  pullRequests(states: $states, orderBy: $orderBy, last: $last) {
    nodes {
      author {
        login
      }
      assignees(last: $last) {
        nodes {
          login
        }
      }
      reviewRequests(last: $last) {
        nodes {
          requestedReviewer {
            ... on User {
              login
            }
          }
        }
        totalCount
      }
      labels(last: $last) {
        nodes {
          name
        }
      }
      isDraft
      mergeable
      reviewDecision
      title
      updatedAt
      publishedAt
      url
    }
  }
}
`;
