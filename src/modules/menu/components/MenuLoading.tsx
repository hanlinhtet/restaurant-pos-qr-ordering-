import React from 'react';

export const MenuLoading = () => {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      <h2 className="text-xl font-semibold text-foreground">Loading your menu...</h2>
    </div>
  );
};
