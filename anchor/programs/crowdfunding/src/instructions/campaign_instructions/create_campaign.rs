use anchor_lang::prelude::*;

use crate::{Campaign, Creator, ANCHOR_DISCRIMINATOR};

#[derive(Accounts)]
pub struct CreateCampaign<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(mut)]
    pub creator_account: Account<'info, Creator>,

    #[account(
        init,
        payer = signer,
        space = ANCHOR_DISCRIMINATOR + Campaign::INIT_SPACE,
        seeds = [b"campaign", creator_account.key().as_ref(), &creator_account.campaigns_count.to_le_bytes().as_ref()],
        bump
    )]
    pub campaign_account: Account<'info, Campaign>,

    pub system_program: Program<'info, System>,
}

pub fn save_campaign(
    context: Context<CreateCampaign>,
    name: String,
    description: String,
    target_amount: u64,
    is_target_amount_visible: bool,
) -> Result<()> {
    context.accounts.campaign_account.set_inner(Campaign {
        name,
        description,
        target_amount,
        is_target_amount_visible,
        amount_donated: 0,
        amount_withdrawn: 0,
        owner: context.accounts.signer.key(),
        bump: context.bumps.campaign_account,
    });

    // Increment the campaigns count in the creator account
    context.accounts.creator_account.campaigns_count += 1;

    Ok(())
}
