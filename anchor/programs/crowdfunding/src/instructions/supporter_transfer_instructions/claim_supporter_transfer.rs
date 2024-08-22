use anchor_lang::prelude::*;

use crate::error::ErrorCode;
use crate::{Creator, SupporterTransferPayment, ANCHOR_DISCRIMINATOR};

#[derive(Accounts)]
pub struct ClaimSupporterTransfer<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(mut)]
    pub creator_account: Account<'info, Creator>,

    #[account(
        init,
        payer = signer,
        space = ANCHOR_DISCRIMINATOR + SupporterTransferPayment::INIT_SPACE,
        seeds = [b"supporterTransferPayment", creator_account.key().as_ref(), &creator_account.supporter_payments_count.to_le_bytes().as_ref()],
        bump
    )]
    pub supporter_transfer_payment_account: Account<'info, SupporterTransferPayment>,

    pub system_program: Program<'info, System>,
}

pub fn claim_supporter_transfer_funds(
    context: Context<ClaimSupporterTransfer>,
    amount: u64,
) -> Result<()> {
    // Validate the withdraw amount to be grater than 0
    require!(amount > 0, ErrorCode::InvalidAmount);

    // Check if the creator account owner is the signer
    require!(
        context.accounts.creator_account.owner == context.accounts.signer.key(),
        ErrorCode::InvalidSigner
    );

    let creator_account = &mut context.accounts.creator_account.to_account_info();
    let wallet = &mut context.accounts.signer.to_account_info();

    // TODO: Apply the fee for the transfer

    // Make the transfer of the given amount
    **creator_account.try_borrow_mut_lamports()? -= amount;
    **wallet.try_borrow_mut_lamports()? += amount;

    // Update the creator available funds and withdrawn funds
    context.accounts.creator_account.withdrawn_funds += amount;

    // Set the supporter transfer payment account details
    context
        .accounts
        .supporter_transfer_payment_account
        .set_inner(SupporterTransferPayment {
            amount,
            creator: creator_account.key(),
            timestamp: Clock::get()?.unix_timestamp,
            bump: context.bumps.supporter_transfer_payment_account,
        });

    // Increment the supporter transfer payment count in the creator account
    context.accounts.creator_account.supporter_payments_count += 1;

    Ok(())
}
