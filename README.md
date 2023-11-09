# "Hello world!" GitHub Action using Rust

🦀 Demo action using Rust \
💡 Inspired by [actions/hello-world-javascript-action]

<table align=center><td>

```rs
use actions_core as core;
use chrono::prelude::*;
fn main() {
    println!("Hello {}!", core::get_input("name"));
    core::set_output("time", &Local::now().format("%H:%M:%S").to_string());
}
```

</table>

<!-- prettier-ignore-start -->
[choosealicense.com]: https://choosealicense.com/
[github actions marketplace]: https://github.com/marketplace?type=actions
[actions/hello-world-javascript-action]: https://github.com/actions/hello-world-javascript-action
[0bsd licensed]: https://github.com/jcbhmr/hello-world-deno-action/blob/main/LICENSE
<!-- prettier-ignore-end -->
