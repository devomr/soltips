use anchor_lang::prelude::*;

use crate::{Creator, ANCHOR_DISCRIMINATOR};

#[derive(Accounts)]
pub struct UpdateCreator<'info> {
    #[account(mut)]
    owner: Signer<'info>,

    #[account(
        mut,
        seeds = [b"creator", owner.key().as_ref()],
        realloc = ANCHOR_DISCRIMINATOR + Creator::INIT_SPACE,
        realloc::payer = owner,
        realloc::zero = true,
        bump
    )]
    pub creator: Account<'info, Creator>,

    pub system_program: Program<'info, System>,
}

pub fn update_details(
    context: Context<UpdateCreator>,
    fullname: String,
    bio: String,
) -> Result<()> {
    let creator = &mut context.accounts.creator;
    creator.fullname = fullname;
    creator.bio = bio;

    Ok(())
}
