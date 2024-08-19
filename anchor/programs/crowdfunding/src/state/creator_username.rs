use anchor_lang::prelude::*;

#[account]
#[derive(Debug, InitSpace)]
pub struct CreatorUsername {
    pub owner: Pubkey,
}
