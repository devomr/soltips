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

    pub fn register_creator(
        context: Context<RegisterCreator>,
        username: String,
        fullname: String,
        bio: String,
    ) -> Result<()> {
        instructions::register_creator::save_creator(context, username, fullname, bio)
    }

    pub fn update_creator(
        context: Context<UpdateCreator>,
        fullname: String,
        bio: String,
    ) -> Result<()> {
        instructions::update_creator::update_details(context, fullname, bio)
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
