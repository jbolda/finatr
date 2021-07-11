# Changelog

## \[0.4.0]

- Bump big.js to v6 (major), and bump @reach/tabs, date-fns, formik, and papaparse minors.
  - [5391219](https://github.com/jbolda/finatr/commit/5391219149f6aab0768a5214a7d4ad1e5cd73c04) chore: bump bigjs to v6 ([#365](https://github.com/jbolda/finatr/pull/365)) on 2020-10-02
- Upgrade d3js to v7.
  - [802a64b](https://github.com/jbolda/finatr/commit/802a64be55f985834eb6e282723bba0bc3e16818) feat: upgrade d3 to v7 ([#405](https://github.com/jbolda/finatr/pull/405)) on 2021-07-10
- Implement covector for publishing. This will let us achieve a similar outcome to gitflow, but with one branch.
  - [b00c0c6](https://github.com/jbolda/finatr/commit/b00c0c6186253ab3649e3f909c86e26b54b94922) feat: add covector for publishing ([#337](https://github.com/jbolda/finatr/pull/337)) on 2020-08-06
- Switch from create-react-app to parcel@v2. We have outgrown the use of CRA, and parcel provides much more performant tooling with the opportunity to make more refined choices around testing as it isn't coupled.
  - [88c1c98](https://github.com/jbolda/finatr/commit/88c1c9881ad632fe7214160ade6d4a6259c87dfb) feat: switch from CRA to parcel ([#394](https://github.com/jbolda/finatr/pull/394)) on 2021-07-05
