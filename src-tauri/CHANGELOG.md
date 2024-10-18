# Changelog

## \[0.3.0]

- [`acdf454`](https://github.com/jbolda/finatr/commit/acdf45479494e55b7f83f1c502420f18c96a73f6) ([#755](https://github.com/jbolda/finatr/pull/755) by [@renovate](https://github.com/jbolda/finatr/../../renovate)) Update tauri monorepo to latest v1.5.
- [`cbc785f`](https://github.com/jbolda/finatr/commit/cbc785f85a2713b3c7ce34c0440f45e943908ff1) ([#451](https://github.com/jbolda/finatr/pull/451) by [@jbolda](https://github.com/jbolda/finatr/../../jbolda)) Change license to Apache2. This had previously been an option in the discussions. While AGPL is appropriate here, those historically pushing it do not act in ways with which we would like to associate. Generally there is less concern around those looking to commit code under this license as well.
- [`a7329c2`](https://github.com/jbolda/finatr/commit/a7329c2dfbf255502e93b7b60c7d3b08b3f597f3) ([#644](https://github.com/jbolda/finatr/pull/644) by [@jbolda](https://github.com/jbolda/finatr/../../jbolda)) Convert to react-aria instead of @reach/ui as it is no longer actively maintained.
- [`8b94d9a`](https://github.com/jbolda/finatr/commit/8b94d9a1e4a0c8c3e87859b91781ca801cdf4e1f) Switch state management to starfx. This improves our ability to handle side effects and control computational load.
- [`e6b0a29`](https://github.com/jbolda/finatr/commit/e6b0a2996c8ef134744c21f2156f8d90f646a8ca) ([#665](https://github.com/jbolda/finatr/pull/665) by [@jbolda](https://github.com/jbolda/finatr/../../jbolda)) Upgrade Tauri to v1 stable.
- [`12c7c50`](https://github.com/jbolda/finatr/commit/12c7c507d4376a8f3b865525b351e51ba7535cf4) ([#793](https://github.com/jbolda/finatr/pull/793) by [@jbolda](https://github.com/jbolda/finatr/../../jbolda)) Upgrade desktop app integration with Tauri to v2 RC.

### Dependencies

- Upgraded to `web@0.5.0`

## \[0.2.1]

- Update autoprefixer to 10.3.7.
  - Bumped due to a bump in web.
  - [06d4c2b](https://github.com/jbolda/finatr/commit/06d4c2b61c908dc1737c10275c84d80d29ccbb29) Update autoprefixer: 10.3.4 → 10.3.7 (patch) ([#450](https://github.com/jbolda/finatr/pull/450)) on 2021-10-08
- Update d3-array to 3.1.1.
  - Bumped due to a bump in web.
  - [0eb5f77](https://github.com/jbolda/finatr/commit/0eb5f771b806536a883f831ab5c24dc4aeaf9e5a) Update d3-array: 3.0.2 → 3.1.1 (minor) ([#448](https://github.com/jbolda/finatr/pull/448)) on 2021-10-08
- Update d3-scale to 4.0.2.
  - Bumped due to a bump in web.
  - [e25bd09](https://github.com/jbolda/finatr/commit/e25bd09da6390262dcaeeb9135f14965f4ebbb15) Update d3-scale: 4.0.0 → 4.0.2 (patch) ([#440](https://github.com/jbolda/finatr/pull/440)) on 2021-10-08
- A handful of footer items came in with the component that weren't used. Remove and/or replace them.
  - Bumped due to a bump in web.
  - [7706a83](https://github.com/jbolda/finatr/commit/7706a83361f11159a6e28105184e7f37c1a1c892) remove extraneous footer items ([#454](https://github.com/jbolda/finatr/pull/454)) on 2021-10-08
- Update tailwindcss to 2.2.16.
  - Bumped due to a bump in web.
  - [493c6fe](https://github.com/jbolda/finatr/commit/493c6feb67488088b5a52b25cfbf891899370831) Update tailwindcss: 2.2.15 → 2.2.16 (patch) ([#444](https://github.com/jbolda/finatr/pull/444)) on 2021-10-08

## \[0.2.0]

- Upgrade Tauri implementation from `tauri@alpha` to `tauri@beta`.
  - [f57b0c1](https://github.com/jbolda/finatr/commit/f57b0c16b0ca3270abb6f2548ce205365c600c39) tauri v1 beta ([#419](https://github.com/jbolda/finatr/pull/419)) on 2021-09-15
