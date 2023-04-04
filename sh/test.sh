ARKCOMMAND="$1"
INSTANCENAME="$2"
source /etc/arkmanager/instances/$INSTANCENAME.cfg

LOGFILE="$logdir/panel.txt"
PIDFILE="$arkserverroot/.$INSTANCENAME.panel.pid"

echo "$$" > $PIDFILE

echo "Start action: $ARKCOMMAND @$1" > $LOGFILE
echo "-----------------------------" >> $LOGFILE
$ARKCOMMAND @$INSTANCENAME >> $LOGFILE
echo "-----------------------------" >> $LOGFILE
echo "Finished!" >> $LOGFILE

echo "0" > $PIDFILE