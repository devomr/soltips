use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Campaign {
    pub id: u64,

    pub owner: Pubkey,

    #[max_len(50)]
    pub name: String,

    #[max_len(250)]
    pub description: String,

    pub target_amount: u64,
    pub amount_donated: u64,
    pub amount_withdrawn: u64,
    pub is_target_amount_visible: bool,

    pub bump: u8,
}
