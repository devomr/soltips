use anchor_lang::prelude::*;
use anchor_lang::solana_program::{program::invoke, system_instruction};

use crate::error::ErrorCode;
use crate::{Creator, SupporterDonation, ANCHOR_DISCRIMINATOR, SUPPORTER_DONATION_FEE_PERCENTAGE};

#[derive(Accounts)]
pub struct SendSupporterDonation<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(mut)]
    pub creator_account: Account<'info, Creator>,

    #[account(
        init,
        payer = signer,
        space = ANCHOR_DISCRIMINATOR + SupporterDonation::INIT_SPACE,
        seeds = [b"supporterDonation", creator_account.key().as_ref(), &creator_account.supporters_count.to_le_bytes().as_ref()],
        bump
    )]
    pub supporter_donation_account: Account<'info, SupporterDonation>,

    #[account(mut)]
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub receiver: AccountInfo<'info>,

    #[account(mut)]
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub fee_collector: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

pub fn save_supporter_donation(
    context: Context<SendSupporterDonation>,
    name: String,
    message: String,
    quantity: u16,
) -> Result<()> {
    let supporter: &mut Signer = &mut context.accounts.signer;
    let creator_account = &mut context.accounts.creator_account;
    let receiver = &mut context.accounts.receiver;
    let fee_collector = &mut context.accounts.fee_collector;

    // Calculate the transfer amount (in lamports) based on the selected quantity
    let transfer_amount: u64 = creator_account.price_per_donation * quantity as u64;

    // Validate the transfer amount to be greater than 0
    require!(transfer_amount > 0, ErrorCode::InvalidAmount);

    // Collect fees from transfer amount
    let fee_amount = (transfer_amount * SUPPORTER_DONATION_FEE_PERCENTAGE) / 100;
    let transfer_amount_without_fees = transfer_amount - fee_amount;

    // Create the fee instruction
    let transfer_fee_instruction =
        system_instruction::transfer(&supporter.key(), &fee_collector.key(), fee_amount);

    // Create the supporter donation instruction
    let supporter_donation_instruction = system_instruction::transfer(
        &supporter.key(),
        &receiver.key(),
        transfer_amount_without_fees,
    );

    // Invoke the fee transfer instruction
    invoke(
        &transfer_fee_instruction,
        &[supporter.to_account_info(), fee_collector.to_account_info()],
    )?;

    invoke(
        &supporter_donation_instruction,
        &[supporter.to_account_info(), receiver.to_account_info()],
    )?;

    // Set the supporter transfer account details
    context
        .accounts
        .supporter_donation_account
        .set_inner(SupporterDonation {
            name,
            message,
            quantity,
            amount: transfer_amount,
            fees: fee_amount,
            item: creator_account.donation_item.clone(),
            supporter: supporter.key(),
            creator: creator_account.key(),
            timestamp: Clock::get()?.unix_timestamp,
            bump: context.bumps.supporter_donation_account,
        });

    // Update the total supporter donations amount
    creator_account.supporter_donations_amount += transfer_amount;

    // Increment the supporters count in the creator account
    creator_account.supporters_count += 1;

    Ok(())
}
