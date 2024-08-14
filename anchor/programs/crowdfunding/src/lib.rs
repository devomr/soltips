pub mod constants;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("7mJdTbF99tvmwMeLZuVoDTaHYuMwazXAeYXojpKFVEX1");

#[program]
pub mod crowdfunding {
    use super::*;

    pub fn initialize(_ctx: Context<Initialize>) -> Result<()> {
        msg!("GM!");
        Ok(())
    }

    pub fn create_campaign(
        context: Context<CreateCampaign>,
        id: u64,
        name: String,
        description: String,
        target_amount: u64,
    ) -> Result<()> {
        instructions::create_campaign::save_campaign(context, id, name, description, target_amount)
    }
}

#[derive(Accounts)]
pub struct Initialize {}
