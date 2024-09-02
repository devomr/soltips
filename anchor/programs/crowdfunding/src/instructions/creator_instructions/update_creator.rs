use anchor_lang::prelude::*;

use crate::error::ErrorCode;
use crate::{Creator, ANCHOR_DISCRIMINATOR, CREATOR_TAG};

#[derive(Accounts)]
pub struct UpdateCreator<'info> {
    #[account(mut)]
    signer: Signer<'info>,

    #[account(
        mut,
        seeds = [CREATOR_TAG, signer.key().as_ref()],
        realloc = ANCHOR_DISCRIMINATOR + Creator::INIT_SPACE,
        realloc::payer = signer,
        realloc::zero = true,
        bump
    )]
    pub creator_account: Account<'info, Creator>,

    pub system_program: Program<'info, System>,
}

pub fn update_creator_profile_data(
    context: Context<UpdateCreator>,
    fullname: String,
    bio: String,
    image_url: String,
) -> Result<()> {
    // Check if the creator account owner is the signer
    require!(
        context.accounts.creator_account.owner == context.accounts.signer.key(),
        ErrorCode::InvalidSigner
    );

    // Update the creator account details
    let creator_account = &mut context.accounts.creator_account;
    creator_account.fullname = fullname;
    creator_account.bio = bio;
    creator_account.image_url = image_url;

    Ok(())
}

pub fn update_creator_page_settings(
    context: Context<UpdateCreator>,
    is_supporters_count_visible: bool,
    price_per_donation: u64,
    donation_item: String,
    theme_color: String,
    thanks_message: String,
) -> Result<()> {
    // Check if the creator account owner is the signer
    require!(
        context.accounts.creator_account.owner == context.accounts.signer.key(),
        ErrorCode::InvalidSigner
    );

    // Update the creator account settings used on the creator page
    let creator_account = &mut context.accounts.creator_account;
    creator_account.is_supporters_count_visible = is_supporters_count_visible;
    creator_account.price_per_donation = price_per_donation;
    creator_account.donation_item = donation_item;
    creator_account.theme_color = theme_color;
    creator_account.thanks_message = thanks_message;

    Ok(())
}
