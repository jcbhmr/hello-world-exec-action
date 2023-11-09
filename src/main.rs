use actions_core as core;
use chrono::prelude::*;
fn main() {
    println!("Hello {}!", core::get_input("name"));
    core::set_output("time", &Local::now().format("%H:%M:%S").to_string());
}
