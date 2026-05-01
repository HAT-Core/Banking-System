import { useState } from 'react';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, Tab, TextField, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import PercentRoundedIcon from '@mui/icons-material/PercentRounded';

const MOCK_BANKS = [
  { bank_id: 1, bank_name: 'Meezan Bank', is_active: true },
  { bank_id: 2, bank_name: 'Habib Bank Limited (HBL)', is_active: true },
  { bank_id: 3, bank_name: 'Standard Chartered', is_active: true },
];

const MOCK_BILLERS = [
  { biller_id: 1, name: 'LESCO', category: 'government' },
  { biller_id: 2, name: 'PTCL', category: 'government' },
  { biller_id: 3, name: 'Nayatel', category: 'private' },
];

const MOCK_LOANS = [
  { loan_type_id: 1, type_name: 'Home Mortgage', interest_rate: 4.5, max_years: 25 },
  { loan_type_id: 2, type_name: 'Auto Finance', interest_rate: 7.2, max_years: 7 },
  { loan_type_id: 3, type_name: 'Personal Loan', interest_rate: 12.5, max_years: 5 },
];

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 4 }}>{children}</Box>}
    </div>
  );
}

const inputSx = {
  '& .MuiOutlinedInput-root': {
    color: '#fff',
    '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
    '&:hover fieldset': { borderColor: 'rgba(96,165,250,0.4)' },
    '&.Mui-focused fieldset': { borderColor: '#60A5FA', borderWidth: 1 },
  },
  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.4)' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#60A5FA' },
  '& .MuiSelect-icon': { color: 'rgba(255,255,255,0.5)' },
};

export default function AdminCatalogs() {
  const [tabValue, setTabValue] = useState(0);

  const [newBank, setNewBank] = useState('');
  const [newBillerName, setNewBillerName] = useState('');
  const [newBillerCategory, setNewBillerCategory] = useState('');
  const [selectedLoan, setSelectedLoan] = useState('');
  const [newRate, setNewRate] = useState('');

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography sx={{ fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: -0.5 }}>System Catalogs</Typography>
        <Typography sx={{ fontSize: 15, color: 'rgba(255,255,255,0.4)' }}>Manage partner banks, utility billers, and global financial rates.</Typography>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'rgba(255,255,255,0.05)' }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          sx={{
            '& .MuiTabs-indicator': { backgroundColor: '#60A5FA', height: 3, borderRadius: '3px 3px 0 0' },
            '& .MuiTab-root': { textTransform: 'none', fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,0.4)', minHeight: 60 },
            '& .Mui-selected': { color: '#60A5FA !important' },
          }}
        >
          <Tab icon={<AccountBalanceRoundedIcon sx={{ mr: 1, mb: '0 !important' }} />} iconPosition="start" label="Supported Banks" />
          <Tab icon={<ReceiptLongRoundedIcon sx={{ mr: 1, mb: '0 !important' }} />} iconPosition="start" label="Registered Billers" />
          <Tab icon={<PercentRoundedIcon sx={{ mr: 1, mb: '0 !important' }} />} iconPosition="start" label="Loan Interest Rates" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Box sx={{ display: 'flex', gap: 2, mb: 4, background: 'rgba(20,20,20,0.4)', p: 3, borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <TextField label="Bank Name" value={newBank} onChange={(e) => setNewBank(e.target.value)} fullWidth size="small" sx={inputSx} />
          <Button variant="contained" startIcon={<AddRoundedIcon />} sx={{ background: '#60A5FA', color: '#0E0E0E', fontWeight: 700, px: 4, borderRadius: '10px', textTransform: 'none', whiteSpace: 'nowrap', '&:hover': { background: '#93C5FD' } }}>
            Add Bank
          </Button>
        </Box>
        <TableContainer sx={{ background: 'rgba(20,20,20,0.6)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', overflow: 'hidden' }}>
          <Table>
            <TableHead sx={{ background: 'rgba(0,0,0,0.4)' }}>
              <TableRow>
                <TableCell sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>ID</TableCell>
                <TableCell sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Bank Name</TableCell>
                <TableCell align="right" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {MOCK_BANKS.map((bank) => (
                <TableRow key={bank.bank_id} sx={{ '&:hover': { background: 'rgba(255,255,255,0.02)' } }}>
                  <TableCell sx={{ color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>#{bank.bank_id}</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.02)' }}>{bank.bank_name}</TableCell>
                  <TableCell align="right" sx={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                    <Box sx={{ display: 'inline-block', px: 1.5, py: 0.5, borderRadius: '6px', background: 'rgba(74,222,128,0.1)', color: '#4ADE80', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>
                      Active
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Box sx={{ display: 'flex', gap: 2, mb: 4, background: 'rgba(20,20,20,0.4)', p: 3, borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <TextField label="Biller Name" value={newBillerName} onChange={(e) => setNewBillerName(e.target.value)} fullWidth size="small" sx={inputSx} />
          <FormControl fullWidth size="small" sx={inputSx}>
            <InputLabel>Category</InputLabel>
            <Select value={newBillerCategory} label="Category" onChange={(e) => setNewBillerCategory(e.target.value)} MenuProps={{ PaperProps: { sx: { bgcolor: '#1A1A1A', color: '#fff' } } }}>
              <MenuItem value="government">Government</MenuItem>
              <MenuItem value="private">Private</MenuItem>
            </Select>
          </FormControl>
          <Button variant="contained" startIcon={<AddRoundedIcon />} sx={{ background: '#60A5FA', color: '#0E0E0E', fontWeight: 700, px: 4, borderRadius: '10px', textTransform: 'none', whiteSpace: 'nowrap', '&:hover': { background: '#93C5FD' } }}>
            Add Biller
          </Button>
        </Box>
        <TableContainer sx={{ background: 'rgba(20,20,20,0.6)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', overflow: 'hidden' }}>
          <Table>
            <TableHead sx={{ background: 'rgba(0,0,0,0.4)' }}>
              <TableRow>
                <TableCell sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>ID</TableCell>
                <TableCell sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Biller Name</TableCell>
                <TableCell align="right" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Category</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {MOCK_BILLERS.map((biller) => (
                <TableRow key={biller.biller_id} sx={{ '&:hover': { background: 'rgba(255,255,255,0.02)' } }}>
                  <TableCell sx={{ color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>#{biller.biller_id}</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.02)' }}>{biller.name}</TableCell>
                  <TableCell align="right" sx={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                    <Box sx={{ display: 'inline-block', px: 1.5, py: 0.5, borderRadius: '6px', background: biller.category === 'government' ? 'rgba(192,132,252,0.1)' : 'rgba(251,191,36,0.1)', color: biller.category === 'government' ? '#C084FC' : '#FBBF24', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>
                      {biller.category}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Box sx={{ display: 'flex', gap: 2, mb: 4, background: 'rgba(20,20,20,0.4)', p: 3, borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <FormControl fullWidth size="small" sx={inputSx}>
            <InputLabel>Select Loan Type</InputLabel>
            <Select value={selectedLoan} label="Select Loan Type" onChange={(e) => setSelectedLoan(e.target.value)} MenuProps={{ PaperProps: { sx: { bgcolor: '#1A1A1A', color: '#fff' } } }}>
              {MOCK_LOANS.map((loan) => (
                <MenuItem key={loan.loan_type_id} value={loan.loan_type_id}>{loan.type_name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField label="New Interest Rate (%)" type="number" value={newRate} onChange={(e) => setNewRate(e.target.value)} fullWidth size="small" sx={inputSx} />
          <Button variant="contained" startIcon={<SaveRoundedIcon />} sx={{ background: '#60A5FA', color: '#0E0E0E', fontWeight: 700, px: 4, borderRadius: '10px', textTransform: 'none', whiteSpace: 'nowrap', '&:hover': { background: '#93C5FD' } }}>
            Update Rate
          </Button>
        </Box>
        <TableContainer sx={{ background: 'rgba(20,20,20,0.6)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', overflow: 'hidden' }}>
          <Table>
            <TableHead sx={{ background: 'rgba(0,0,0,0.4)' }}>
              <TableRow>
                <TableCell sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>ID</TableCell>
                <TableCell sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Loan Product</TableCell>
                <TableCell sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Max Term (Years)</TableCell>
                <TableCell align="right" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Current Interest Rate</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {MOCK_LOANS.map((loan) => (
                <TableRow key={loan.loan_type_id} sx={{ '&:hover': { background: 'rgba(255,255,255,0.02)' } }}>
                  <TableCell sx={{ color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>#{loan.loan_type_id}</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.02)' }}>{loan.type_name}</TableCell>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.6)', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>Up to {loan.max_years} years</TableCell>
                  <TableCell align="right" sx={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                    <Typography sx={{ color: '#60A5FA', fontWeight: 800, fontSize: 16 }}>{loan.interest_rate}%</Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>
    </Box>
  );
}