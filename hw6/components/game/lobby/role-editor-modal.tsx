"use client";

import React, { useState, useEffect, useRef } from "react";
import { Role } from "@prisma/client";

interface RoleInfo {
  name: string;
  team: "GOOD" | "EVIL";
  desc: string;
}

const ROLE_INFO: Record<Role, RoleInfo> = {
  MERLIN: { name: "梅林", team: "GOOD", desc: "好人陣營的首領。你知道所有壞人是誰，但不能暴露身分。" },
  PERCIVAL: { name: "派西維爾", team: "GOOD", desc: "梅林的護衛。你會看到梅林和莫甘娜，但不知道誰是誰。" },
  SERVANT: { name: "亞瑟的忠臣", team: "GOOD", desc: "忠誠的好人。你不知道誰是隊友，只能靠推理。" },
  MORGANA: { name: "莫甘娜", team: "EVIL", desc: "壞人陣營。你會假扮成梅林欺騙派西維爾。" },
  ASSASSIN: { name: "刺客", team: "EVIL", desc: "壞人陣營。如果好人贏了，你可以刺殺梅林來逆轉。" },
  MINION: { name: "莫德雷德的爪牙", team: "EVIL", desc: "壞人陣營。你知道誰是隊友。" },
  OBERON: { name: "奧伯倫", team: "EVIL", desc: "壞人陣營。你不知道隊友是誰，隊友也不知道你是誰。" },
  MORDRED: { name: "莫德雷德", team: "EVIL", desc: "壞人首領。梅林看不到你。" },
};

interface RoleEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRoles: Role[];
  maxPlayers: number;
  onSave: (roles: Role[]) => Promise<void>;
}

export function RoleEditorModal({ 
  isOpen, 
  onClose, 
  currentRoles, 
  maxPlayers,
  onSave 
}: RoleEditorModalProps) {
  const [selectedRoles, setSelectedRoles] = useState<Role[]>(currentRoles);
  const [isSaving, setIsSaving] = useState(false);
  const prevIsOpenRef = useRef(false);

  // Get default roles based on maxPlayers
  const getDefaultRoles = (maxPlayers: number): Role[] => {
    const defaultConfig: Record<number, Role[]> = {
      2: [Role.MERLIN, Role.ASSASSIN],
      3: [Role.MERLIN, Role.SERVANT, Role.ASSASSIN],
      4: [Role.MERLIN, Role.SERVANT, Role.MORGANA, Role.ASSASSIN],
      5: [Role.MERLIN, Role.PERCIVAL, Role.SERVANT, Role.MORGANA, Role.ASSASSIN],
      6: [Role.MERLIN, Role.PERCIVAL, Role.SERVANT, Role.SERVANT, Role.MORGANA, Role.ASSASSIN],
      7: [Role.MERLIN, Role.PERCIVAL, Role.SERVANT, Role.SERVANT, Role.MORGANA, Role.ASSASSIN, Role.MINION],
      8: [Role.MERLIN, Role.PERCIVAL, Role.SERVANT, Role.SERVANT, Role.SERVANT, Role.MORGANA, Role.ASSASSIN, Role.MINION],
      9: [Role.MERLIN, Role.PERCIVAL, Role.SERVANT, Role.SERVANT, Role.SERVANT, Role.SERVANT, Role.MORGANA, Role.ASSASSIN, Role.MINION],
      10: [Role.MERLIN, Role.PERCIVAL, Role.SERVANT, Role.SERVANT, Role.SERVANT, Role.SERVANT, Role.MORGANA, Role.ASSASSIN, Role.MINION, Role.MINION],
    };
    return defaultConfig[maxPlayers] || [];
  };

  // Initialize selected roles only when modal opens (transition from closed to open)ㄖ
  useEffect(() => {
    // Only initialize when transitioning from closed to open
    if (isOpen && !prevIsOpenRef.current) {
      // Use currentRoles if available, otherwise use default config
      const rolesToUse = currentRoles.length > 0 ? [...currentRoles] : getDefaultRoles(maxPlayers);
      setSelectedRoles(rolesToUse);
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen, currentRoles, maxPlayers]);

  if (!isOpen) return null;

  const goodRoles: Role[] = [Role.MERLIN, Role.PERCIVAL, Role.SERVANT];
  const evilRoles: Role[] = [Role.MORGANA, Role.ASSASSIN, Role.MINION, Role.OBERON, Role.MORDRED];

  const getRoleCount = (role: Role) => {
    return selectedRoles.filter(r => r === role).length;
  };

  const addRole = (role: Role) => {
    if (selectedRoles.length >= maxPlayers) {
      alert(`已達到最大玩家數 ${maxPlayers} 人`);
      return;
    }
    
    const newRoles = [...selectedRoles, role];
    
    // MORGANA and PERCIVAL must be added together
    if (role === Role.MORGANA) {
      // Check if we can add PERCIVAL too
      if (newRoles.length < maxPlayers) {
        newRoles.push(Role.PERCIVAL);
      } else {
        // Can't add both, revert
        alert(`無法同時添加莫甘納和派西維爾：已達到最大玩家數 ${maxPlayers} 人`);
        return;
      }
    } else if (role === Role.PERCIVAL) {
      // Check if we can add MORGANA too
      if (newRoles.length < maxPlayers) {
        newRoles.push(Role.MORGANA);
      } else {
        // Can't add both, revert
        alert(`無法同時添加莫甘納和派西維爾：已達到最大玩家數 ${maxPlayers} 人`);
        return;
      }
    }
    
    setSelectedRoles(newRoles);
  };

  const removeRole = (role: Role) => {
    // Prevent removing MERLIN if there's only one left
    if (role === Role.MERLIN) {
      const merlinCount = selectedRoles.filter(r => r === Role.MERLIN).length;
      if (merlinCount <= 1) {
        alert("必須至少保留一個梅林");
        return;
      }
    }

    // Find the first occurrence of this role and remove it
    const index = selectedRoles.findIndex(r => r === role);
    if (index === -1) return; // Role not found

    const newRoles = [...selectedRoles];
    newRoles.splice(index, 1);
    
    // MORGANA and PERCIVAL must be removed together
    if (role === Role.MORGANA) {
      // Also remove one PERCIVAL
      const percivalIndex = newRoles.findIndex(r => r === Role.PERCIVAL);
      if (percivalIndex !== -1) {
        newRoles.splice(percivalIndex, 1);
      }
    } else if (role === Role.PERCIVAL) {
      // Also remove one MORGANA
      const morganaIndex = newRoles.findIndex(r => r === Role.MORGANA);
      if (morganaIndex !== -1) {
        newRoles.splice(morganaIndex, 1);
      }
    }
    
    setSelectedRoles(newRoles);
  };

  const handleSave = async () => {
    if (selectedRoles.length !== maxPlayers) {
      alert(`角色數量必須等於 ${maxPlayers} 人`);
      return;
    }

    // Validate: Must have at least one MERLIN (good team leader)
    if (!selectedRoles.includes(Role.MERLIN)) {
      alert("必須至少有一個梅林（好人陣營首領）");
      return;
    }

    // Validate: Must have at least one ASSASSIN (evil team leader)
    if (!selectedRoles.includes(Role.ASSASSIN)) {
      alert("必須至少有一個刺客（壞人陣營首領）");
      return;
    }

    setIsSaving(true);
    try {
      await onSave(selectedRoles);
      onClose();
    } catch (error) {
      alert(`儲存失敗: ${error}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    // Reset to default config based on maxPlayers
    setSelectedRoles(getDefaultRoles(maxPlayers));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-700 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-amber-500">編輯角色配置</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-700/50 rounded-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="mb-4 p-3 bg-slate-900/50 rounded-lg border border-slate-700">
            <div className="text-sm text-slate-300">
              已選擇: <span className="font-bold text-white">{selectedRoles.length}</span> / <span className="font-bold text-white">{maxPlayers}</span> 個角色
            </div>
          </div>

          {/* Good Team */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-blue-400 mb-3 flex items-center gap-2">
              <span className="text-xl">🔵</span>
              好人陣營
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {goodRoles.map((role) => {
                const count = getRoleCount(role);
                const info = ROLE_INFO[role];
                return (
                  <div key={role} className="bg-slate-900/50 rounded-lg border border-blue-700/30 p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="font-semibold text-white">{info.name}</div>
                        <div className="text-xs text-slate-400 mt-1">{info.desc}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => removeRole(role)}
                          disabled={count === 0 || (role === Role.MERLIN && count === 1)}
                          className="text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors p-1 rounded hover:bg-slate-700/50"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                        <span className="font-bold text-white min-w-[2rem] text-center">{count}</span>
                        <button
                          onClick={() => addRole(role)}
                          disabled={selectedRoles.length >= maxPlayers}
                          className="text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors p-1 rounded hover:bg-slate-700/50"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Evil Team */}
          <div>
            <h3 className="text-lg font-bold text-red-400 mb-3 flex items-center gap-2">
              <span className="text-xl">🔴</span>
              壞人陣營
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {evilRoles.map((role) => {
                const count = getRoleCount(role);
                const info = ROLE_INFO[role];
                return (
                  <div key={role} className="bg-slate-900/50 rounded-lg border border-red-700/30 p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="font-semibold text-white">{info.name}</div>
                        <div className="text-xs text-slate-400 mt-1">{info.desc}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => removeRole(role)}
                          disabled={count === 0 || (role === Role.MERLIN && count === 1)}
                          className="text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors p-1 rounded hover:bg-slate-700/50"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                        <span className="font-bold text-white min-w-[2rem] text-center">{count}</span>
                        <button
                          onClick={() => addRole(role)}
                          disabled={selectedRoles.length >= maxPlayers}
                          className="text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors p-1 rounded hover:bg-slate-700/50"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-700 flex items-center justify-between gap-3">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors"
          >
            重置為預設
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || selectedRoles.length !== maxPlayers}
              className="px-4 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              {isSaving ? "儲存中..." : "儲存"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

