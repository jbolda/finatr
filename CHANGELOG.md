# Changelog

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
