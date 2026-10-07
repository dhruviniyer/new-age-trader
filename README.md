# The New Age Trader

Personal trading dashboard with Risk & Quantity, Trading Journal, Portfolio,
Trading Mistakes, Chart Analysis and Trading Psychology.

## Run and check

```sh
npm ci
npm test
npm run dev
```

`npm run build` retains the existing Railway build. `npm run build:pages`
builds the same dashboard for the `/new-age-trader/` GitHub Pages path.

## GitHub Pages hosting

1. Open this repository's **Settings → Pages** and choose **GitHub Actions** as
   the deployment source.
2. For this private repository, GitHub Pages requires GitHub Pro or another
   eligible paid plan. Repository visibility is not changed by the workflow.
3. Push to `main`, or run **Build and deploy dashboard to GitHub Pages** from
   the Actions tab. Pull requests run the build and backup checks without
   publishing a site.
4. Use the website URL shown by the successful `github-pages` deployment.

Expected project URL once Pages is enabled and deployment succeeds:
https://dhruviniyer.github.io/new-age-trader/

## Bring your saved data to the new link

Dashboard records and chart images are saved in the browser on the device where
they were entered. A different hostname has separate browser storage; hosting
migration alone cannot copy those records.

1. On the same browser/device where your saved records appear, open the Railway
   dashboard and click **Backup**. Keep the downloaded JSON file.
2. Open the new dashboard, click **Restore**, select that backup and review the
   record counts before restoring.
3. Confirm that trades, holdings, lessons, chart images and checklist have moved
   successfully before retiring the Railway deployment.

Backups stay with you and are not sent to GitHub. Restore replaces the dashboard
records in that browser; use **Backup current data** first to retain any existing
records at the destination. Backups can also move records between your devices.
