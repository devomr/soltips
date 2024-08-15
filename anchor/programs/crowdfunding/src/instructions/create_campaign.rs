use anchor_lang::prelude::*;

use crate::{Campaign, ANCHOR_DISCRIMINATOR};

#[derive(Accounts)]
#[instruction(id: u64)]
pub struct CreateCampaign<'info> {
    #[account(mut)]
    owner: Signer<'info>,

    #[account(
        init,
        payer = owner,
        space = ANCHOR_DISCRIMINATOR + Campaign::INIT_SPACE,
        seeds = [b"campaign", owner.key().as_ref(), id.to_le_bytes().as_ref()],
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
        owner: context.accounts.owner.key(),
        bump: context.bumps.campaign,
    });
    Ok(())
}
