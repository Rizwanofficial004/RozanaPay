import { Card, CardContent, Typography, Box } from '@mui/material';

const StatsCard = ({ title, value, icon, color = 'primary' }) => {
  return (
    <Card className="h-full">
      <CardContent>
        <Box className="flex justify-between items-start">
          <Box>
            <Typography color="text.secondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="div" fontWeight="bold">
              {value}
            </Typography>
          </Box>
          <Box
            sx={{
              backgroundColor: `${color}.light`,
              color: `${color}.main`,
              borderRadius: 2,
              p: 1.5,
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
