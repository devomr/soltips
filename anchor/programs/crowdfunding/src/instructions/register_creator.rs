use anchor_lang::prelude::*;

use crate::{Creator, ANCHOR_DISCRIMINATOR};

#[derive(Accounts)]
pub struct RegisterCreator<'info> {
    #[account(mut)]
    owner: Signer<'info>,

    #[account(
        init,
        payer = owner,
        space = ANCHOR_DISCRIMINATOR + Creator::INIT_SPACE,
        seeds = [b"creator", owner.key().as_ref()],
        bump
    )]
    pub creator: Account<'info, Creator>,

    pub system_program: Program<'info, System>,
}

pub fn save_creator(
    context: Context<RegisterCreator>,
    username: String,
    fullname: String,
    bio: String,
) -> Result<()> {
    context.accounts.creator.set_inner(Creator {
        username,
        fullname,
        bio,
        owner: context.accounts.owner.key(),
        bump: context.bumps.creator,
    });
    Ok(())
}
