use anchor_lang::prelude::*;

use crate::{Creator, ANCHOR_DISCRIMINATOR};

#[derive(Accounts)]
#[instruction(username: String)]
pub struct RegisterCreator<'info> {
    #[account(
        init,
        payer = owner,
        space = ANCHOR_DISCRIMINATOR + Creator::INIT_SPACE,
        seeds = [b"creator", username.as_bytes()],
        bump
    )]
    pub creator: Account<'info, Creator>,

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
    // Save the new creator
    context.accounts.creator.set_inner(Creator {
        username,
        fullname,
        bio,
        owner: context.accounts.owner.key(),
        bump: context.bumps.creator,
    });
    Ok(())
}
