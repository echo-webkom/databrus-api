export const mockUpcomingMatchHtml = `
<html>
<body>
  <li wire:key="listkamp_12345">
    <div x-data="{
      timestamp: 1769900400
    }">
      <div class="truncate">Team A</div>
      <div class="truncate">Team B</div>
    </div>
  </li>
  <li wire:key="listkamp_12346">
    <div x-data="{
      timestamp: 1769904000
    }">
      <div class="truncate">Team C</div>
      <div class="truncate">Team D</div>
    </div>
  </li>
</body>
</html>
`;

export const mockPreviousMatchHtml = `
<html>
<body>
  <li wire:key="listkamp_67890">
    <div x-data="{
      homegoals: '3',
      awaygoals: '2',
      timestamp: 1768000000
    }">
      <div class="truncate">Team X</div>
      <div class="truncate">Team Y</div>
    </div>
  </li>
  <li wire:key="listkamp_67891">
    <div x-data="{
      homegoals: '1',
      awaygoals: '1',
      timestamp: 1768003600
    }">
      <div class="truncate">Team Z</div>
      <div class="truncate">Team W</div>
    </div>
  </li>
</body>
</html>
`;
