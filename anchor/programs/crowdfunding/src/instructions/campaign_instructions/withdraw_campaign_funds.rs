use anchor_lang::prelude::*;

use crate::error::ErrorCode;
use crate::Campaign;

#[derive(Accounts)]
pub struct WithdrawCampaignFunds<'info> {
    #[account(mut)]
    signer: Signer<'info>,

    #[account(mut)]
    pub campaign_account: Account<'info, Campaign>,

    pub system_program: Program<'info, System>,
}

pub fn withdraw_funds(context: Context<WithdrawCampaignFunds>, amount: u64) -> Result<()> {
    // Check if the creator account owner is the signer
    require!(
        context.accounts.campaign_account.owner == context.accounts.signer.key(),
        ErrorCode::InvalidSigner
    );

    let campaign_account = &mut context.accounts.campaign_account;
    let wallet = &context.accounts.signer;

    // Calculate minimum balance for rent exemption
    let rent_balance = Rent::get()?.minimum_balance(campaign_account.to_account_info().data_len());

    // Check if campaign account has sufficient funds after withdrawal
    require!(
        **campaign_account.to_account_info().lamports.borrow() - rent_balance >= amount,
        ErrorCode::InsufficientFundsAfterWithdraw
    );

    // Perform the funds transfer
    **campaign_account
        .to_account_info()
        .try_borrow_mut_lamports()? -= amount;
    **wallet.to_account_info().try_borrow_mut_lamports()? += amount;

    campaign_account.amount_withdrawn += amount;

    Ok(())
}
