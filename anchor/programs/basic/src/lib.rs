use anchor_lang::prelude::*;

declare_id!("CGvsHkmVq65MjCZ4NUkSUxAsNYTaghp24BuGvVyJEdZh");

#[program]
pub mod basic {
    use super::*;

    pub fn greet(_ctx: Context<Initialize>) -> Result<()> {
        msg!("GM!");
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
