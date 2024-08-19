use anchor_lang::prelude::*;

use crate::error::ErrorCode;
use crate::{Creator, CreatorUsername, ANCHOR_DISCRIMINATOR};

#[derive(Accounts)]
#[instruction(username: String)]
pub struct RegisterCreator<'info> {
    #[account(
        init,
        payer = owner,
        space = ANCHOR_DISCRIMINATOR + Creator::INIT_SPACE,
        seeds = [b"creator", owner.key().as_ref()],
        bump
    )]
    pub creator: Account<'info, Creator>,

    #[account(
        init,
        payer = owner,
        space = ANCHOR_DISCRIMINATOR + CreatorUsername::INIT_SPACE,
        seeds = [b"username", username.as_bytes()],
        bump,
    )]
    pub creator_username: Account<'info, CreatorUsername>,

    #[account(mut)]
    owner: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn save_creator(
    context: Context<RegisterCreator>,
    username: String,
    fullname: String,
    bio: String,
) -> Result<()> {
    // Check if the username is already taken
    let creator_username = &context.accounts.creator_username;
    if creator_username.owner != Pubkey::default() {
        return err!(ErrorCode::UsernameAlreadyExists);
    }

    // Save the new creator
    context.accounts.creator.set_inner(Creator {
        username,
        fullname,
        bio,
        supporters_count: 0,
        owner: context.accounts.owner.key(),
        bump: context.bumps.creator,
    });

    // Update the username record
    context.accounts.creator_username.owner = context.accounts.owner.key();

    Ok(())
}
