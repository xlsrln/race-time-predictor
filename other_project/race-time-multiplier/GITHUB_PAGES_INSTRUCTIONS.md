
# GitHub Pages Deployment Instructions

This project is configured to be deployed to GitHub Pages. Follow these steps to deploy:

## Automatic Deployment

When you push changes to the main branch, a GitHub Action will automatically build and deploy your site.

1. Push your changes to the main branch:
   ```
   git push origin main
   ```

2. Wait for the GitHub Action to complete (check the Actions tab in your GitHub repository)

3. Your site will be available at: `https://yourusername.github.io/race-time-multiplier/`
   (Replace `yourusername` with your actual GitHub username)

## Manual Deployment

You can also deploy manually:

1. Run the deployment script:
   ```
   npm run deploy
   ```

2. Your site will be built and published to the gh-pages branch

## Repository Setup

First time setting up? Make sure to:

1. Push your code to GitHub
2. Go to your repository settings on GitHub
3. Navigate to Pages section
4. Select the gh-pages branch as the source
5. Save the changes

After the first deployment, your site should be available at the URL mentioned above.
