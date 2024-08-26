pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("EWcK31xgYQpVUqQwt796Yv2DNuvnepQ9gmvdTxBRRCps");

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
        instructions::register_creator::register_new_creator(context, username, fullname, bio)
    }

    pub fn update_creator_profile(
        context: Context<UpdateCreator>,
        fullname: String,
        bio: String,
        image_url: String,
    ) -> Result<()> {
        instructions::update_creator::update_creator_profile_data(context, fullname, bio, image_url)
    }

    pub fn update_creator_page(
        context: Context<UpdateCreator>,
        is_supporters_count_visible: bool,
        price_per_donation: u64,
        donation_item: String,
        thanks_message: String,
    ) -> Result<()> {
        instructions::update_creator::update_creator_page_settings(
            context,
            is_supporters_count_visible,
            price_per_donation,
            donation_item,
            thanks_message,
        )
    }

    pub fn send_supporter_donation(
        context: Context<SendSupporterDonation>,
        name: String,
        message: String,
        quantity: u16,
    ) -> Result<()> {
        instructions::supporter_donation_instructions::save_supporter_donation(
            context, name, message, quantity,
        )
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
