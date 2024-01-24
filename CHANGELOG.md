# Changelog

## \[0.5.0]

- [`b7babe6`](https://github.com/jbolda/finatr/commit/b7babe63fd78adaf7129643500f286c1e787de3e)([#652](https://github.com/jbolda/finatr/pull/652)) Update parcel 2.9.3 → 2.10.3 (minor)
- [`2ea024c`](https://github.com/jbolda/finatr/commit/2ea024cc1c81823d6691600840bf95688e3e3838)([#660](https://github.com/jbolda/finatr/pull/660)) Update react-router-dom 6.0.2 → 6.21.1 (minor)
- [`a08c3e8`](https://github.com/jbolda/finatr/commit/a08c3e8634db5cdb046632245a99cd56baaab1db)([#669](https://github.com/jbolda/finatr/pull/669)) bumped ynab to v2
- [`8ea59e8`](https://github.com/jbolda/finatr/commit/8ea59e83c38bb515e5338572bdc277015ea7283e)([#670](https://github.com/jbolda/finatr/pull/670)) Switch web build to ESM based. This improves compatibility with the component testing, and hopefully the greater ecosystem as other libraries began to move over.
- [`b7a2334`](https://github.com/jbolda/finatr/commit/b7a23340ab67a8a7397520f2bbf7ea1dfc73709f)([#673](https://github.com/jbolda/finatr/pull/673)) Upgrade to react-aria v1, tailwind v3 and bump other component libs.
- [`a361456`](https://github.com/jbolda/finatr/commit/a361456620ae8cbd360a553189bb0e0f2d3b9717)([#674](https://github.com/jbolda/finatr/pull/674)) Update parcel 2.10.3 → 2.11.0 (minor)
- [`e7ad8fb`](https://github.com/jbolda/finatr/commit/e7ad8fb0361ddb98fc9b8267a29e116e5085f61d)([#691](https://github.com/jbolda/finatr/pull/691)) Include `react-aria` tailwind starter kit for a whole host of components to use. We swapped out the `Switch` component, but all others are currently unused.
- [`00d277b`](https://github.com/jbolda/finatr/commit/00d277b87f9964f1e6ab71b82d09c8af14e88f5f)([#473](https://github.com/jbolda/finatr/pull/473)) Update @headlessui/react to 1.4.2.
- [`2950a37`](https://github.com/jbolda/finatr/commit/2950a3766fabd4f3b253864c8e9f528d324c92fc)([#241](https://github.com/jbolda/finatr/pull/241)) We have pulled out the planning into a new route separate from the cash flow analysis. The planning page will help someone build up something that could serve as a budget, but with more granularity and time elements related to it. It is currently a snapshot of today, but we can expand it to multiple snapshots that lead into the future. Building up and refining leads one into the cash flow analysis more gradually rather than dumping someone into what is likely considered more advanced concepts.
- [`b689287`](https://github.com/jbolda/finatr/commit/b689287d46795f4c40f3cb16b0b0d90dd7914662)([#471](https://github.com/jbolda/finatr/pull/471)) Lazy load routes and code split through it. This let's us ship smaller chunks based on the routes that you visit.
- [`cbc785f`](https://github.com/jbolda/finatr/commit/cbc785f85a2713b3c7ce34c0440f45e943908ff1)([#451](https://github.com/jbolda/finatr/pull/451)) Change license to Apache2. This had previously been an option in the discussions. While AGPL is appropriate here, those historically pushing it do not act in ways with which we would like to associate. Generally there is less concern around those looking to commit code under this license as well.
- [`6e9d934`](https://github.com/jbolda/finatr/commit/6e9d934df9cedc30b2b091b41ba7bd2553909734)([#462](https://github.com/jbolda/finatr/pull/462)) Upgrade parcel to v2.0.0.
- [`25235de`](https://github.com/jbolda/finatr/commit/25235dec97ebba3956758f600c953b0b412597a8)([#470](https://github.com/jbolda/finatr/pull/470)) Upgrade parcel to v2.0.1.
- [`4d9e530`](https://github.com/jbolda/finatr/commit/4d9e530d1cd1323b38fd0ee9bb1f2de781c3e76c)([#685](https://github.com/jbolda/finatr/pull/685)) Upgrade postcss to 8.3.11.
- [`a7329c2`](https://github.com/jbolda/finatr/commit/a7329c2dfbf255502e93b7b60c7d3b08b3f597f3)([#644](https://github.com/jbolda/finatr/pull/644)) Convert to react-aria instead of @reach/ui as it is no longer actively maintained.
- [`4c35c2f`](https://github.com/jbolda/finatr/commit/4c35c2f8f8c95463eb6c536128183e4a43f4d54c)([#686](https://github.com/jbolda/finatr/pull/686)) Implement starfx as a wrapper to incrementally replace existing state. This new state management will better enable parallel and async tasks which will improve client side calculation percevied performance.
- [`b7d04d6`](https://github.com/jbolda/finatr/commit/b7d04d6f41e18b2e820907e49f4485072ad42ce2)([#468](https://github.com/jbolda/finatr/pull/468)) Upgrade tailwindcss to `2.2.19`.
- [`4d9e530`](https://github.com/jbolda/finatr/commit/4d9e530d1cd1323b38fd0ee9bb1f2de781c3e76c)([#685](https://github.com/jbolda/finatr/pull/685)) Upgrade @tailwindcss/forms to `0.3.4`.

## \[0.4.1]

- Update autoprefixer to 10.3.7.
  - [06d4c2b](https://github.com/jbolda/finatr/commit/06d4c2b61c908dc1737c10275c84d80d29ccbb29) Update autoprefixer: 10.3.4 → 10.3.7 (patch) ([#450](https://github.com/jbolda/finatr/pull/450)) on 2021-10-08
- Update d3-array to 3.1.1.
  - [0eb5f77](https://github.com/jbolda/finatr/commit/0eb5f771b806536a883f831ab5c24dc4aeaf9e5a) Update d3-array: 3.0.2 → 3.1.1 (minor) ([#448](https://github.com/jbolda/finatr/pull/448)) on 2021-10-08
- Update d3-scale to 4.0.2.
  - [e25bd09](https://github.com/jbolda/finatr/commit/e25bd09da6390262dcaeeb9135f14965f4ebbb15) Update d3-scale: 4.0.0 → 4.0.2 (patch) ([#440](https://github.com/jbolda/finatr/pull/440)) on 2021-10-08
- A handful of footer items came in with the component that weren't used. Remove and/or replace them.
  - [7706a83](https://github.com/jbolda/finatr/commit/7706a83361f11159a6e28105184e7f37c1a1c892) remove extraneous footer items ([#454](https://github.com/jbolda/finatr/pull/454)) on 2021-10-08
- Update tailwindcss to 2.2.16.
  - [493c6fe](https://github.com/jbolda/finatr/commit/493c6feb67488088b5a52b25cfbf891899370831) Update tailwindcss: 2.2.15 → 2.2.16 (patch) ([#444](https://github.com/jbolda/finatr/pull/444)) on 2021-10-08

## \[0.4.0]

- Bump big.js to v6 (major), and bump @reach/tabs, date-fns, formik, and papaparse minors.
  - [5391219](https://github.com/jbolda/finatr/commit/5391219149f6aab0768a5214a7d4ad1e5cd73c04) chore: bump bigjs to v6 ([#365](https://github.com/jbolda/finatr/pull/365)) on 2020-10-02
  - [6d5ced9](https://github.com/jbolda/finatr/commit/6d5ced96c08dc424f6d426c4686084809fb55ff8) setup full release flow ([#421](https://github.com/jbolda/finatr/pull/421)) on 2021-09-16
- Upgrade d3js to v7.
  - [802a64b](https://github.com/jbolda/finatr/commit/802a64be55f985834eb6e282723bba0bc3e16818) feat: upgrade d3 to v7 ([#405](https://github.com/jbolda/finatr/pull/405)) on 2021-07-10
  - [6d5ced9](https://github.com/jbolda/finatr/commit/6d5ced96c08dc424f6d426c4686084809fb55ff8) setup full release flow ([#421](https://github.com/jbolda/finatr/pull/421)) on 2021-09-16
- Implement covector for publishing. This will let us achieve a similar outcome to gitflow, but with one branch.
  - [b00c0c6](https://github.com/jbolda/finatr/commit/b00c0c6186253ab3649e3f909c86e26b54b94922) feat: add covector for publishing ([#337](https://github.com/jbolda/finatr/pull/337)) on 2020-08-06
  - [6d5ced9](https://github.com/jbolda/finatr/commit/6d5ced96c08dc424f6d426c4686084809fb55ff8) setup full release flow ([#421](https://github.com/jbolda/finatr/pull/421)) on 2021-09-16
- Switch from create-react-app to parcel@v2. We have outgrown the use of CRA, and parcel provides much more performant tooling with the opportunity to make more refined choices around testing as it isn't coupled.
  - [88c1c98](https://github.com/jbolda/finatr/commit/88c1c9881ad632fe7214160ade6d4a6259c87dfb) feat: switch from CRA to parcel ([#394](https://github.com/jbolda/finatr/pull/394)) on 2021-07-05
  - [6d5ced9](https://github.com/jbolda/finatr/commit/6d5ced96c08dc424f6d426c4686084809fb55ff8) setup full release flow ([#421](https://github.com/jbolda/finatr/pull/421)) on 2021-09-16
- This update removes `theme-ui` and replaces it with `tailwindcss`. This improves runtime performance with the tradeoff of greater reliance on classes. While there are opinions on the verbosity of the utility class based system, most of this will be hidden away within components and elements over time.
  - [52e034a](https://github.com/jbolda/finatr/commit/52e034a287b0455f663ea2d3636dc09862e6ce1d) feat: switch to tailwind ([#409](https://github.com/jbolda/finatr/pull/409)) on 2021-09-11
  - [6d5ced9](https://github.com/jbolda/finatr/commit/6d5ced96c08dc424f6d426c4686084809fb55ff8) setup full release flow ([#421](https://github.com/jbolda/finatr/pull/421)) on 2021-09-16
