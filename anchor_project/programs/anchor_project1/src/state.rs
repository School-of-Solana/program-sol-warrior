use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Vault {
    pub creator: Pubkey,
    pub bump: u8,
    pub total_tips: u64,
}
