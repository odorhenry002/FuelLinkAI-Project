# Branch Protection Recommendations

To protect the default branch and keep the project production-ready, configure the repository settings as follows:

1. Require a pull request before merging.
2. Require at least 1 approving review.
3. Require status checks to pass before merging:
   - Backend tests
   - Frontend quality checks
   - Formatting checks
   - CodeQL
4. Require branches to be up to date before merging.
5. Require conversation resolution on all PRs.
6. Do not allow bypassing the above settings for admins unless there is an emergency and a documented exception.
7. Restrict direct pushes to the default branch.
8. Consider requiring signed commits for release branches.

This should be applied to the default branch, typically `main`.
