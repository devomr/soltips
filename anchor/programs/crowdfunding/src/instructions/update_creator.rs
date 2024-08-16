use anchor_lang::prelude::*;

use crate::{Creator, ANCHOR_DISCRIMINATOR};

#[derive(Accounts)]
#[instruction(username: String)]
pub struct UpdateCreator<'info> {
    #[account(mut)]
    owner: Signer<'info>,

    #[account(
        mut,
        seeds = [b"creator", username.as_bytes()],
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
    _username: String,
    fullname: String,
    bio: String,
) -> Result<()> {
    let creator = &mut context.accounts.creator;
    creator.fullname = fullname;
    creator.bio = bio;

    Ok(())
}
