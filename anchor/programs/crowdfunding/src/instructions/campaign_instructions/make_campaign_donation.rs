use anchor_lang::prelude::*;
use anchor_lang::solana_program::program::invoke;
use anchor_lang::solana_program::system_instruction;

use crate::error::ErrorCode;
use crate::Campaign;

#[derive(Accounts)]
pub struct MakeCampaignDonation<'info> {
    #[account(mut)]
    signer: Signer<'info>,

    #[account(mut)]
    pub campaign_account: Account<'info, Campaign>,

    pub system_program: Program<'info, System>,
}

pub fn make_donation(context: Context<MakeCampaignDonation>, amount: u64) -> Result<()> {
    // Validate the transfer amount to be greater than 0
    require!(amount > 0, ErrorCode::InvalidAmount);

    let signer = &mut context.accounts.signer;
    let campaign_account = &mut context.accounts.campaign_account;

    // Create the transfer instruction
    let transfer_instruction = system_instruction::transfer(
        &signer.key(),
        &campaign_account.to_account_info().key(),
        amount,
    );

    invoke(
        &transfer_instruction,
        &[signer.to_account_info(), campaign_account.to_account_info()],
    )?;

    // Update the campaign account's amount donated
    campaign_account.amount_donated += amount;

    Ok(())
}
