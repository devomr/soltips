use anchor_lang::prelude::*;
use anchor_lang::solana_program::{program::invoke, system_instruction};

use crate::error::ErrorCode;
use crate::{Creator, SupporterTransfer, ANCHOR_DISCRIMINATOR};

#[derive(Accounts)]
pub struct DepositSupporterTransfer<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(mut)]
    pub creator_account: Account<'info, Creator>,

    #[account(
        init,
        payer = signer,
        space = ANCHOR_DISCRIMINATOR + SupporterTransfer::INIT_SPACE,
        seeds = [b"supporterTransfer", creator_account.key().as_ref(), &creator_account.supporters_count.to_le_bytes().as_ref()],
        bump
    )]
    pub supporter_transfer_account: Account<'info, SupporterTransfer>,

    pub system_program: Program<'info, System>,
}

pub fn deposit_supporter_transfer_funds(
    context: Context<DepositSupporterTransfer>,
    name: String,
    message: String,
    quantity: u16,
) -> Result<()> {
    let supporter: &mut Signer = &mut context.accounts.signer;
    let creator_account = &mut context.accounts.creator_account;

    // Calculate the transfer amount (in lamports) based on the selected quantity
    let transfer_amount = creator_account.price_per_donation * quantity as u64;

    // Validate the transfer amount to be greater than 0
    require!(transfer_amount > 0, ErrorCode::InvalidAmount);

    // Create the transfer instruction
    let transfer_instruction = system_instruction::transfer(
        &supporter.key(),
        creator_account.to_account_info().key,
        transfer_amount,
    );

    invoke(
        &transfer_instruction,
        &[
            supporter.to_account_info(),
            creator_account.to_account_info(),
        ],
    )?;

    // Set the supporter transfer account details
    context
        .accounts
        .supporter_transfer_account
        .set_inner(SupporterTransfer {
            name,
            message,
            transfer_amount,
            quantity,
            donation_item: creator_account.donation_item.clone(),
            supporter: supporter.key(),
            creator: creator_account.key(),
            timestamp: Clock::get()?.unix_timestamp,
            bump: context.bumps.supporter_transfer_account,
        });

    // Increment the supporters count in the creator account
    creator_account.supporters_count += 1;

    Ok(())
}
