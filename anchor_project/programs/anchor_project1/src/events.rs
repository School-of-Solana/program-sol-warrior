use anchor_lang::prelude::*;

#[event]
pub struct InitVaultEvent {
    pub vault: Pubkey,
    pub creator: Pubkey,
}

#[event]
pub struct TipDeposited {
    pub sender: Pubkey,
    pub recipient: Pubkey,
    pub amount: u64,
}

#[event]
pub struct TipWithdrawEvent {
    pub sender: Pubkey,
    pub recipient: Pubkey,
    pub amount: u64,
}
