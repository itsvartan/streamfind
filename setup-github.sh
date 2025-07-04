#!/bin/bash

echo "🚀 StreamFind GitHub Setup"
echo "========================="
echo ""
echo "Please enter your GitHub username:"
read GITHUB_USERNAME

echo ""
echo "Setting up remote repository..."
git remote add origin https://github.com/$GITHUB_USERNAME/streamfind.git

echo "Pushing to GitHub..."
git branch -M main
git push -u origin main

echo ""
echo "✅ Done! Your code is now on GitHub."
echo ""
echo "Next steps:"
echo "1. Go to https://vercel.com"
echo "2. Import your repository: https://github.com/$GITHUB_USERNAME/streamfind"
echo "3. Add your API keys as environment variables"
echo "4. Deploy!"
echo ""
echo "📖 See DEPLOYMENT_GUIDE.md for detailed instructions"