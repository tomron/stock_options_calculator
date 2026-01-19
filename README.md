# Stock Options Calculator

A simple, client-side calculator to compute the value of employee stock options. Calculate intrinsic value, vested amounts, after-tax returns, and model different exit scenarios.

## Features

### Simple Calculator
- **Intrinsic Value Calculation**: (Current Stock Price - Strike Price) × Number of Options
- **Vesting Tracking**: See vested vs unvested options and their current value
- **Tax Calculations**: Estimate after-tax value based on your tax rate
- **Exit Scenarios**: Model potential outcomes at different stock prices (IPO, acquisition, etc.)

### Vesting Timeline
- **Visual Timeline Graph**: See how your options vest over time with an interactive chart
- **Customizable Vesting Schedule**: Configure vesting period (e.g., 4 years), cliff period (e.g., 1 year)
- **Flexible Vesting Frequency**: Choose monthly, quarterly, semi-annual, or annual vesting
- **Value Projections**: Track both option count and monetary value (before and after tax) over time
- **Multiple Chart Lines**: View vested options count, before-tax value, and after-tax value on one graph

### General
- **Responsive Design**: Works on desktop and mobile devices
- **No Backend Required**: All calculations run in your browser
- **Tab-Based Interface**: Easy switching between simple calculator and vesting timeline

## Running Locally

### Option 1: Double-click the file (easiest)
Simply open `index.html` in your web browser by double-clicking it.

### Option 2: Using a local server
If you prefer using a local server:

```bash
# Using Python 3
python3 -m http.server 8000

# Using Python 2
python -m SimpleHTTPServer 8000

# Using Node.js (if you have npx)
npx serve
```

Then open `http://localhost:8000` in your browser.

## Deploying to GitHub Pages

1. **Create a new repository** on GitHub (or use this one if you've already cloned it)

2. **Enable GitHub Pages**:
   - Go to your repository Settings
   - Navigate to "Pages" in the left sidebar
   - Under "Build and deployment":
     - Source: Select "GitHub Actions"

3. **Push your code**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```

4. **Automatic Deployment**: The GitHub Action will automatically deploy your site. You can view the deployment progress in the "Actions" tab of your repository.

5. **Access Your Site**: Once deployed, your calculator will be available at:
   ```
   https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/
   ```

## How to Use the Calculator

### Simple Calculator Tab

1. **Number of Options Granted**: Total stock options you received
2. **Strike Price**: The price per share you pay to exercise the options
3. **Current Stock Price**: Current fair market value per share
4. **Vested Percentage**: What percentage of your options have vested (0-100%)
5. **Tax Rate**: Your combined federal + state tax rate (typically 25-50%)
6. **Exit Scenarios** (optional): Enter comma-separated prices (e.g., "50, 100, 150") to model different exit valuations

Click "Calculate Value" to see:
- Total intrinsic value of all options
- Gain per option
- Number of vested vs unvested options
- Current vested value (before and after tax)
- Potential values at different exit prices

### Vesting Timeline Tab

1. **Number of Options Granted**: Total stock options you received
2. **Strike Price**: The price per share you pay to exercise the options
3. **Current Stock Price**: Current fair market value per share
4. **Vesting Period**: Total duration over which options vest (e.g., 4 years)
5. **Cliff Period**: Time before any options vest (e.g., 1 year means nothing vests until year 1)
6. **Vesting Frequency**: How often options vest after the cliff
   - Monthly: Options vest every month
   - Quarterly: Options vest every 3 months
   - Semi-Annually: Options vest every 6 months
   - Annually: Options vest every year
7. **Tax Rate**: Your combined federal + state tax rate
8. **Grant Date**: When the options were granted to you

Click "Generate Vesting Timeline" to see an interactive chart showing:
- Number of vested options over time (blue line)
- Before-tax value over time (green line)
- After-tax value over time (purple line)

## Examples

### Simple Calculator Example

If you have:
- 10,000 options
- $5 strike price
- $25 current stock price
- 50% vested
- 30% tax rate

The calculator shows:
- Total value: $200,000
- Vested options: 5,000
- Vested value: $100,000
- After-tax value: $70,000

### Vesting Timeline Example

If you have:
- 10,000 options
- $10 strike price
- $50 current stock price
- 4-year vesting period
- 1-year cliff
- Monthly vesting after cliff
- 30% tax rate
- Grant date: January 1, 2024

The chart will show:
- 0 options vested for the first year (cliff period)
- 2,500 options vesting at the 1-year mark (25% cliff vest)
- Gradual monthly vesting after that, reaching 10,000 by year 4
- Value growing from $0 to $280,000 after tax over the 4 years

## License

MIT License - feel free to use and modify as needed.
