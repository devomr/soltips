use anchor_lang::{prelude::*, solana_program::native_token::LAMPORTS_PER_SOL};

use crate::{Creator, CreatorUsername, ANCHOR_DISCRIMINATOR, CREATOR_TAG, USERNAME_TAG};

#[derive(Accounts)]
#[instruction(username: String)]
pub struct RegisterCreator<'info> {
    #[account(mut)]
    signer: Signer<'info>,

    #[account(
        init,
        payer = signer,
        space = ANCHOR_DISCRIMINATOR + Creator::INIT_SPACE,
        seeds = [CREATOR_TAG, signer.key().as_ref()],
        bump
    )]
    pub creator_account: Account<'info, Creator>,

    #[account(
        init,
        payer = signer,
        space = ANCHOR_DISCRIMINATOR + CreatorUsername::INIT_SPACE,
        seeds = [USERNAME_TAG, username.as_bytes()],
        bump,
    )]
    pub creator_username_account: Account<'info, CreatorUsername>,

    pub system_program: Program<'info, System>,
}

pub fn register_new_creator(
    context: Context<RegisterCreator>,
    username: String,
    fullname: String,
    bio: String,
) -> Result<()> {
    const DEFAULT_PRICE_PER_DONATION: u64 = (0.1 * LAMPORTS_PER_SOL as f64) as u64; // equivalent of 0.1 SOL
    const DEFAULT_DONATION_ITEM: &str = "coffee";
    const DEFAULT_THEME_COLOR: &str = "#794BC4";

    // Set the creator account details
    context.accounts.creator_account.set_inner(Creator {
        username,
        fullname,
        bio,
        image_url: "".to_owned(),
        is_supporters_count_visible: true,
        price_per_donation: DEFAULT_PRICE_PER_DONATION,
        donation_item: DEFAULT_DONATION_ITEM.to_string(),
        theme_color: DEFAULT_THEME_COLOR.to_string(),
        thanks_message: "".to_owned(),
        supporters_count: 0,
        campaigns_count: 0,
        supporter_donations_amount: 0,
        owner: context.accounts.signer.key(),
        social_links: Vec::new(),
        bump: context.bumps.creator_account,
    });

    // Set the creator username account details
    context.accounts.creator_username_account.owner = context.accounts.signer.key();

    Ok(())
}
