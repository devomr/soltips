use anchor_lang::prelude::*;

use crate::{Campaign, ANCHOR_DISCRIMINATOR};

#[derive(Accounts)]
#[instruction(id: u64)]
pub struct CreateCampaign<'info> {
    #[account(mut)]
    creator: Signer<'info>,

    #[account(
        init,
        payer = creator,
        space = ANCHOR_DISCRIMINATOR + Campaign::INIT_SPACE,
        seeds = [b"campaign", creator.key().as_ref(), id.to_le_bytes().as_ref()],
        bump
    )]
    pub campaign: Account<'info, Campaign>,

    pub system_program: Program<'info, System>,
}

pub fn save_campaign(
    context: Context<CreateCampaign>,
    id: u64,
    name: String,
    description: String,
    target_amount: u64,
) -> Result<()> {
    context.accounts.campaign.set_inner(Campaign {
        id,
        name,
        description,
        target_amount,
        amount_donated: 0,
        creator: context.accounts.creator.key(),
        bump: context.bumps.campaign,
    });
    Ok(())
}
