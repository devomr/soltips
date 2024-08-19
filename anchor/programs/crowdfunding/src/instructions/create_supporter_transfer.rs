use anchor_lang::prelude::*;
use anchor_lang::solana_program::native_token::LAMPORTS_PER_SOL;
use anchor_lang::solana_program::system_instruction;

use crate::error::ErrorCode;
use crate::{Creator, SupporterTransfer, ANCHOR_DISCRIMINATOR};

#[derive(Accounts)]
pub struct CreateSupporterTransfer<'info> {
    #[account(mut)]
    pub supporter: Signer<'info>,

    #[account(mut)]
    pub creator: Account<'info, Creator>,

    #[account(mut)]
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub receiver: AccountInfo<'info>,

    #[account(
        init,
        payer = supporter,
        space = ANCHOR_DISCRIMINATOR + SupporterTransfer::INIT_SPACE,
        seeds = [b"supporterTransfer", creator.key().as_ref(), &creator.supporters_count.to_le_bytes().as_ref()],
        bump
    )]
    pub supporter_transfer: Account<'info, SupporterTransfer>,

    pub system_program: Program<'info, System>,
}

pub fn save_supporter_transfer(
    context: Context<CreateSupporterTransfer>,
    name: String,
    message: String,
    item_type: String,
    quantity: u16,
    price: f64,
) -> Result<()> {
    let supporter: &mut Signer = &mut context.accounts.supporter;
    let creator = &mut context.accounts.creator;
    let receiver = &mut context.accounts.receiver;
    let clock = Clock::get()?;

    // Calculate the amount donated in lamports
    let transfer_amount = price * quantity as f64;

    if transfer_amount == 0.0 {
        return err!(ErrorCode::InvalidTransferAmount);
    }

    let transfer_amount_lamports = (transfer_amount * LAMPORTS_PER_SOL as f64) as u64;

    // Create the transfer instruction
    let transfer_instruction =
        system_instruction::transfer(&supporter.key(), &receiver.key(), transfer_amount_lamports);

    // Invoke the transfer instruction
    anchor_lang::solana_program::program::invoke(
        &transfer_instruction,
        &[supporter.to_account_info(), receiver.to_account_info()],
    )?;

    // Set the supporter transfer details
    context
        .accounts
        .supporter_transfer
        .set_inner(SupporterTransfer {
            name,
            message,
            transfer_amount,
            item_type,
            quantity,
            price,
            timestamp: clock.unix_timestamp,
            supporter: context.accounts.supporter.key(),
            creator: creator.key(),
            bump: context.bumps.supporter_transfer,
        });

    // Increment the supporters count in the creator account
    creator.supporters_count += 1;

    Ok(())
}
